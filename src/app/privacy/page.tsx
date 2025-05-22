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
  title: "Privacy Policy | NotePro",
  description:
    "Privacy Policy for NotePro - Learn how we protect your data and privacy.",
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-muted-foreground mb-6 flex items-center space-x-1 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Privacy Policy</span>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Privacy Policy
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
              At NotePro, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our note-taking
              service.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Create an account</li>
              <li>Create and edit notes</li>
              <li>Share notes publicly</li>
              <li>Contact our support team</li>
              <li>Subscribe to our newsletter</li>
            </ul>

            <p>The types of information we may collect include:</p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Personal identifiers (name, email address)</li>
              <li>Account credentials</li>
              <li>Content of your notes</li>
              <li>Usage data and analytics</li>
              <li>Device information</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              How We Use Your Information
            </h2>
            <p>
              We may use the information we collect for various purposes,
              including to:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends and usage</li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
              <li>Personalize your experience</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect the security of your personal information. However, please
              be aware that no method of transmission over the Internet or
              method of electronic storage is 100% secure.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Data Retention</h2>
            <p>
              We will retain your information for as long as your account is
              active or as needed to provide you with our services. We will also
              retain and use your information as necessary to comply with our
              legal obligations, resolve disputes, and enforce our agreements.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>
                The right to access personal information we hold about you
              </li>
              <li>The right to request correction of inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>
                The right to restrict or object to our processing of your
                information
              </li>
              <li>The right to data portability</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our service and hold certain information. Cookies are files
              with a small amount of data that may include an anonymous unique
              identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our service.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Third-Party Services
            </h2>
            <p>
              Our service may contain links to third-party websites, services,
              or applications. We are not responsible for the privacy practices
              or the content of these third-party services. We encourage you to
              review the privacy policies of any third-party service you access.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date at the top of this policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">
              <li>Email: PLACEHOLDER</li>
              <li>Address: PLACEHOLDER</li>
            </ul>
          </div>

          <Separator className="my-6" />

          <div className="mt-4">
            <Link href="/terms">
              <Button variant="link" className="text-primary pl-0">
                View our Terms of Service
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
