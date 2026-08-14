export const SUBMISSIONS_PAGE_SIZE = 20;

export function parseSubmissionPage(value: string | null | undefined): number {
  const page = Number(value ?? "1");
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function submissionPageFromRank(
  rank: number,
  pageSize = SUBMISSIONS_PAGE_SIZE,
): number {
  return Math.floor(rank / pageSize) + 1;
}

export function submissionPageRange(
  page: number,
  pageSize: number,
  total: number,
): { start: number; end: number } {
  if (total === 0) return { start: 0, end: 0 };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}
