import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export const metadata = {
  title: "Terms of Service | NotePro",
  description:
    "Terms of Service for NotePro - Learn about the rules and guidelines for using our platform.",
};

export default function TermsOfService() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-muted-foreground mb-6 flex items-center space-x-1 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Terms of Service</span>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Terms of Service
          </CardTitle>
          <CardDescription className="text-lg">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              Welcome to NotePro. Please read these Terms of Service ("Terms")
              carefully as they contain important information about your legal
              rights, remedies, and obligations. By accessing or using the
              NotePro platform, you agree to comply with and be bound by these
              Terms.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Acceptance of Terms
            </h2>
            <p>
              By registering for and/or using the Service in any manner, you
              agree to these Terms and all other operating rules, policies, and
              procedures that may be published by NotePro, which are
              incorporated by reference.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Changes to Terms
            </h2>
            <p>
              NotePro reserves the right, at our sole discretion, to modify or
              replace these Terms at any time. If a revision is material, we
              will provide at least 30 days' notice prior to any new terms
              taking effect. What constitutes a material change will be
              determined at our sole discretion.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Account Registration
            </h2>
            <p>
              To use certain features of the Service, you must register for an
              account. You must provide accurate, current, and complete
              information during the registration process and keep your account
              information up-to-date.
            </p>
            <p>
              You are responsible for safeguarding your account authentication
              credentials and for all activities that occur under your account.
              You agree to notify NotePro immediately of any unauthorized use of
              your account.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">User Content</h2>
            <p>
              Our Service allows you to create, save, and share content,
              including notes, documents, and other materials (collectively,
              "User Content"). You retain ownership of your User Content.
            </p>
            <p>
              By submitting User Content to the Service, you grant NotePro a
              worldwide, non-exclusive, royalty-free license to use, copy,
              modify, create derivative works based upon, distribute, and
              display your User Content for the purpose of operating and
              providing the Service.
            </p>
            <p>
              You represent and warrant that: (i) you own the User Content or
              have the right to use it and grant the rights in these Terms, and
              (ii) your User Content does not violate these Terms.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Prohibited Conduct
            </h2>
            <p>
              You agree not to engage in any of the following prohibited
              activities:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Violating any applicable law or regulation</li>
              <li>
                Infringing upon the intellectual property rights of others
              </li>
              <li>Uploading or transmitting viruses or malicious code</li>
              <li>
                Attempting to interfere with or compromise the system integrity
                or security
              </li>
              <li>
                Collecting or harvesting any personally identifiable information
              </li>
              <li>Impersonating any person or entity</li>
              <li>Using the Service for any illegal or unauthorized purpose</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach these
              Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately
              cease. If you wish to terminate your account, you may simply
              discontinue using the Service or delete your account.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
              NotePro expressly disclaims all warranties of any kind, whether
              express or implied, including but not limited to the implied
              warranties of merchantability, fitness for a particular purpose,
              and non-infringement.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Limitation of Liability
            </h2>
            <p>
              In no event shall NotePro, its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the Service.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of
              [Your Jurisdiction], without regard to its conflict of law
              provisions. Our failure to enforce any right or provision of these
              Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Email: PLACEHOLDER</li>
              <li>Address: PLACEHOLDER</li>
            </ul>
          </div>

          <Separator className="my-6" />

          <div className="mt-4">
            <Link href="/privacy">
              <Button variant="link" className="text-primary pl-0">
                View our Privacy Policy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
