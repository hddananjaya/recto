import { prisma } from "@/lib/prisma";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);
  const resetAt = new Date(windowStart.getTime() + windowSeconds * 1000);

  const count = await prisma.rateLimit.count({
    where: {
      key,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await prisma.rateLimit.create({ data: { key } });

  // Prune old entries asynchronously.
  void prisma.rateLimit.deleteMany({
    where: { createdAt: { lt: windowStart } },
  });

  return { allowed: true, remaining: maxRequests - count - 1, resetAt };
}
