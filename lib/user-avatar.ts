import type { User } from "@/lib/types";

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-cyan-100 text-cyan-800",
] as const;

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getGravatarUrl(
  email: string,
  size = 96,
): Promise<string> {
  const hash = await sha256Hex(email);
  const params = new URLSearchParams({
    s: String(size),
    d: "404",
    r: "g",
  });
  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
}

export function getUserInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export function getUserAvatarColorClass(email: string): string {
  let hash = 0;
  for (let index = 0; index < email.length; index += 1) {
    hash = (hash + email.charCodeAt(index)) % 9973;
  }

  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
}

export type AvatarImageStage = "oauth" | "gravatar" | "initials";

export function getInitialAvatarStage(user: Pick<User, "avatarUrl">): AvatarImageStage {
  return user.avatarUrl ? "oauth" : "gravatar";
}
