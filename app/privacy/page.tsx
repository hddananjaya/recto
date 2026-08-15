import Link from "next/link";

import {
  LegalLayout,
  legalPageMetadata,
} from "@/components/legal/legal-layout";
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_SITE_NAME,
} from "@/lib/legal";
import { GITHUB_URL } from "@/components/landing/constants";

export const metadata = legalPageMetadata(
  "Privacy Policy",
  "How Recto handles data on this website and in self-hosted deployments.",
);

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="This policy explains what data is collected when you use this website, sign in, submit a form, or run your own Recto instance."
    >
      <section>
        <h2>Who this applies to</h2>
        <p>
          {LEGAL_SITE_NAME} is open-source form software. If you visit this
          website, use the demo, sign in, or submit a response to a published
          form hosted here, this policy applies to how that instance handles
          your data.
        </p>
        <p>
          If someone else runs {LEGAL_SITE_NAME} on their own server, they are
          the data controller for that instance. This policy does not govern
          self-hosted deployments you do not operate.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> If you sign in with Google, we
            receive your name, email address, and profile image from Google. We
            do not receive your Google password.
          </li>
          <li>
            <strong>Form responses.</strong> Answers you submit to a published
            form are stored in our database and may be synced to a Google Sheet
            connected by the form owner.
          </li>
          <li>
            <strong>Uploaded files.</strong> If a form accepts file uploads,
            those files are stored in object storage linked to the submission.
          </li>
          <li>
            <strong>Technical data.</strong> We may process a hashed version of
            your IP address for rate limiting and abuse prevention. We do not
            store raw IP addresses in submission records.
          </li>
          <li>
            <strong>Usage events.</strong> Anonymous landing-page events (for
            example, demo or GitHub link clicks) may be logged server-side. We
            do not use third-party ad or analytics pixels.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use data</h2>
        <ul>
          <li>Authenticate you and operate your account.</li>
          <li>Store and deliver form submissions to the form owner.</li>
          <li>Sync submissions to Google Sheets when the owner has connected one.</li>
          <li>Prevent spam, abuse, and excessive automated submissions.</li>
          <li>Operate, secure, and improve the service.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </section>

      <section>
        <h2>Google services</h2>
        <p>
          Sign-in uses Google OAuth. Sheet sync uses a Google service account
          that form owners explicitly share with. Google&apos;s own privacy
          policy applies to data processed by Google when you use their
          services.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          Account data is kept while your account exists. Submissions are kept
          until deleted by the form owner or when the form is removed.
          Demo forms may be reset or removed without notice.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            You can stop using the service at any time. Form respondents can
            avoid submitting a form.
          </li>
          <li>
            To request access, correction, or deletion of data tied to this
            website, contact us via{" "}
            <a href={LEGAL_CONTACT_URL} target="_blank" rel="noreferrer">
              {LEGAL_CONTACT_LABEL}
            </a>
            . If you submitted a form, contact the form owner first — they
            control that data.
          </li>
        </ul>
      </section>

      <section>
        <h2>Self-hosting</h2>
        <p>
          The {LEGAL_SITE_NAME} source code is available on{" "}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          . Operators of self-hosted instances are responsible for their own
          privacy notices and compliance obligations.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. Continued use of the
          website after changes are posted means you accept the updated policy.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
