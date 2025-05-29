import { db } from "~/server/db";
import { z } from "zod";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create the user with error handling for standalone MongoDB
    try {
      const user = await db.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      });

      // Return the user without the password
      return NextResponse.json(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        { status: 201 },
      );
    } catch (createError: any) {
      // Handle MongoDB replica set error specifically
      if (createError.message?.includes("replica set")) {
        console.error("MongoDB replica set error:", createError.message);
        return NextResponse.json(
          {
            error:
              "Database configuration error. Please contact administrator.",
          },
          { status: 503 },
        );
      }

      // Handle duplicate email error (in case of race condition)
      if (
        createError.code === 11000 ||
        createError.message?.includes("duplicate")
      ) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 },
        );
      }

      throw createError; // Re-throw other errors
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 },
    );
  }
}
