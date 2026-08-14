const GITHUB_API_REPO = "https://api.github.com/repos/hddananjaya/recto";

export async function getGithubStars(): Promise<number | null> {
  try {
    const res = await fetch(GITHUB_API_REPO, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
