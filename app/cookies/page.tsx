import Link from "next/link";

import {
  LegalLayout,
  legalPageMetadata,
} from "@/components/legal/legal-layout";
import { LEGAL_SITE_NAME } from "@/lib/legal";

export const metadata = legalPageMetadata(
  "Cookie Policy",
  "How Recto uses cookies and similar technologies on this website.",
);

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="This page explains how cookies are used when you browse or sign in to this website."
    >
      <section>
        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored in your browser. They help
          websites remember your session and preferences.
        </p>
      </section>

      <section>
        <h2>Cookies we use</h2>
        <ul>
          <li>
            <strong>Authentication cookies.</strong> When you sign in, we set
            session cookies so you stay logged in. These are essential for the
            service to work.
          </li>
          <li>
            <strong>Security cookies.</strong> Cookies related to sign-in may
            also help protect against cross-site request forgery.
          </li>
        </ul>
        <p>
          We do not use third-party advertising cookies or cross-site tracking
          pixels on this website.
        </p>
      </section>

      <section>
        <h2>Local storage</h2>
        <p>
          The form editor and public forms may use browser local storage to save
          draft answers on your device. This data stays in your browser unless
          you submit a form.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can block or delete cookies in your browser settings. Blocking
          essential cookies will prevent you from signing in.
        </p>
        <p>
          Signing out removes your session on this device.
        </p>
      </section>

      <section>
        <h2>Self-hosted instances</h2>
        <p>
          Operators of self-hosted {LEGAL_SITE_NAME} deployments may configure
          cookies differently. Check with the operator of the instance you use.
        </p>
        <p>
          See also our{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
