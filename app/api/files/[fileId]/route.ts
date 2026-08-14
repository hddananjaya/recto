import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getObject } from "@/lib/storage/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const asset = await prisma.fileAsset.findFirst({
    where: {
      id: fileId,
      form: { ownerId: session.user.id },
      submissionId: { not: null },
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const { body, contentType } = await getObject(asset.storageKey);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType ?? asset.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(asset.originalName)}"`,
        "Content-Length": String(asset.size),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
