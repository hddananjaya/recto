export const RESPONSE_QUERY_PARAM = "response";

export function buildSubmissionsUrl(
  formId: string,
  options: { page?: number; responseId?: string | null } = {},
): string {
  const params = new URLSearchParams();
  const { page = 1, responseId } = options;

  if (page > 1) {
    params.set("page", String(page));
  }

  if (responseId) {
    params.set(RESPONSE_QUERY_PARAM, responseId);
  }

  const query = params.toString();
  return `/forms/${formId}/submissions${query ? `?${query}` : ""}`;
}

export function getSelectedResponseId(
  searchParams: Pick<URLSearchParams, "get">,
): string | undefined {
  const responseId = searchParams.get(RESPONSE_QUERY_PARAM);
  return responseId || undefined;
}
