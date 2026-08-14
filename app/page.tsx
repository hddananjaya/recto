import { LandingPageClient } from "@/components/landing/landing-page-client";
import { getGithubStars } from "@/lib/github-stars";

export default async function Home() {
  const starCount = await getGithubStars();

  return <LandingPageClient starCount={starCount} />;
}
