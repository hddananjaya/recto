import Link from "next/link";

import {
  LegalLayout,
  legalPageMetadata,
} from "@/components/legal/legal-layout";
import { GITHUB_URL } from "@/components/landing/constants";
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_SITE_NAME,
} from "@/lib/legal";

export const metadata = legalPageMetadata(
  "Terms of Service",
  "Terms for using the Recto website, demo, and hosted instance.",
);

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="By using this website or signing in, you agree to these terms."
    >
      <section>
        <h2>Overview</h2>
        <p>
          {LEGAL_SITE_NAME} is open-source software for building forms that sync
          to Google Sheets. These terms govern your use of this website and any
          hosted demo or account we provide. The software itself is released
          under the MIT License — see the{" "}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            repository
          </a>{" "}
          for license terms.
        </p>
      </section>

      <section>
        <h2>Eligibility</h2>
        <p>
          You must be able to form a binding contract in your jurisdiction. If
          you use the service on behalf of an organization, you represent that
          you have authority to bind that organization.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>You are responsible for activity under your account.</li>
          <li>
            Sign-in is provided through Google. Keep your Google account secure.
          </li>
          <li>
            We may suspend or terminate access for abuse, illegal activity, or
            risk to the service.
          </li>
        </ul>
      </section>

      <section>
        <h2>Form owners and respondents</h2>
        <p>
          If you create forms, you are responsible for the content of those
          forms, obtaining any required consents from respondents, and complying
          with laws that apply to the data you collect.
        </p>
        <p>
          If you submit a response to someone else&apos;s form, you understand
          your answers are sent to that form&apos;s owner and may be stored in
          their database and connected Google Sheet.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for unlawful, harmful, or deceptive purposes.</li>
          <li>Attempt to disrupt, probe, or overload the service.</li>
          <li>Collect data from others without a lawful basis.</li>
          <li>Upload malware or infringing content.</li>
        </ul>
      </section>

      <section>
        <h2>Demo forms</h2>
        <p>
          Demo forms are provided for evaluation. They may be reset, deleted, or
          rate-limited without notice. Do not rely on them for production or
          sensitive data.
        </p>
      </section>

      <section>
        <h2>Self-hosted software</h2>
        <p>
          If you deploy {LEGAL_SITE_NAME} yourself, you operate that instance.
          These website terms do not replace your own terms with your users. The
          MIT License disclaims warranties for the software — see the license
          text in the repository.
        </p>
      </section>

      <section>
        <h2>Disclaimers</h2>
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, to the fullest extent permitted by
          law. We do not guarantee uninterrupted or error-free operation.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {LEGAL_SITE_NAME} and its
          contributors will not be liable for indirect, incidental, special,
          consequential, or punitive damages, or for loss of data, profits, or
          goodwill arising from your use of the service.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href={LEGAL_CONTACT_URL} target="_blank" rel="noreferrer">
            {LEGAL_CONTACT_LABEL}
          </a>
          .
        </p>
        <p>
          See also our <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
