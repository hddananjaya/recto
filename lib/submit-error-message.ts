/** Map API submit failures to human-readable copy for respondents. */
export function submitErrorMessage(
  status: number,
  body?: { error?: string },
): string {
  const apiError = body?.error?.trim();

  if (status === 429) {
    return "Too many responses from your network. Please wait a minute and try again.";
  }

  if (status === 404) {
    return "This form is no longer available.";
  }

  if (status === 400 && apiError) {
    if (apiError.toLowerCase().includes("validation")) {
      return "Some answers look invalid. Go back and check your responses.";
    }
    return apiError;
  }

  if (status >= 500) {
    return "Our server had a problem saving your response. Please try again in a moment.";
  }

  if (apiError) return apiError;

  return "Something went wrong while submitting. Please try again.";
}
