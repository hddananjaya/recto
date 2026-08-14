export function getServiceAccountEmailFromEnv(): string | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    const credentials = JSON.parse(raw) as { client_email?: unknown };
    return typeof credentials.client_email === "string"
      ? credentials.client_email
      : null;
  } catch {
    return null;
  }
}
