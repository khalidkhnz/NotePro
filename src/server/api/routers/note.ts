import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const noteRouter = createTRPCRouter({
  // Create a new note (authenticated users only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.note.create({
        data: {
          title: input.title,
          content: input.content,
          isPublic: input.isPublic,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Get all notes for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  // Get a single note by ID (public or owned by user)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      // Check if note is public or owned by user
      if (!note.isPublic && note.userId !== ctx.session?.user.id) {
        throw new Error("Unauthorized");
      }

      return note;
    }),

  // Get all public notes
  getAllPublic: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.note.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  // Update a note
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        content: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db.note.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
          isPublic: input.isPublic,
        },
      });
    }),

  // Toggle note public status
  togglePublic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db.note.update({
        where: {
          id: input.id,
        },
        data: {
          isPublic: !note.isPublic,
        },
      });
    }),

  // Delete a note
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.note.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.db.note.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
