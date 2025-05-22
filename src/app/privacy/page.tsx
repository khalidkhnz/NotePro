import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

      <div className="space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            At NotePro, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website and use our note-taking
            service.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul>
            <li>Create an account</li>
            <li>Create and edit notes</li>
            <li>Share notes publicly</li>
            <li>Contact our support team</li>
            <li>Subscribe to our newsletter</li>
          </ul>

          <p>The types of information we may collect include:</p>
          <ul>
            <li>Personal identifiers (name, email address)</li>
            <li>Account credentials</li>
            <li>Content of your notes</li>
            <li>Usage data and analytics</li>
            <li>Device information</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We may use the information we collect for various purposes,
            including to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Develop new products and services</li>
            <li>Monitor and analyze trends and usage</li>
            <li>
              Detect, investigate, and prevent fraudulent transactions and other
              illegal activities
            </li>
            <li>Personalize your experience</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect the security of your personal information. However, please
            be aware that no method of transmission over the Internet or method
            of electronic storage is 100% secure.
          </p>

          <h2>Data Retention</h2>
          <p>
            We will retain your information for as long as your account is
            active or as needed to provide you with our services. We will also
            retain and use your information as necessary to comply with our
            legal obligations, resolve disputes, and enforce our agreements.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </p>
          <ul>
            <li>The right to access personal information we hold about you</li>
            <li>The right to request correction of inaccurate information</li>
            <li>The right to request deletion of your information</li>
            <li>
              The right to restrict or object to our processing of your
              information
            </li>
            <li>The right to data portability</li>
          </ul>

          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity
            on our service and hold certain information. Cookies are files with
            a small amount of data that may include an anonymous unique
            identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, if you do not accept cookies,
            you may not be able to use some portions of our service.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites, services, or
            applications. We are not responsible for the privacy practices or
            the content of these third-party services. We encourage you to
            review the privacy policies of any third-party service you access.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date at the top of this policy.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <ul>
            <li>Email: PLACEHOLDER</li>
            <li>Address: PLACEHOLDER</li>
          </ul>
        </div>

        <div className="border-t pt-6">
          <Link href="/terms" className="text-primary hover:underline">
            View our Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
