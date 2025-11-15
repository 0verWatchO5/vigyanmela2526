import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { comment, shareUrl, title, description } = await req.json();
  if (!shareUrl) {
    return NextResponse.json({ error: "shareUrl required" }, { status: 400 });
  }

  // Fetch member id (URN) if not present
  const meRes = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!meRes.ok) {
    const txt = await meRes.text();
    return NextResponse.json({ error: "Failed to fetch profile", details: txt }, { status: 400 });
  }
  const me = await meRes.json();
  const personUrn = `urn:li:person:${me.id}`;

  const body = {
    author: personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: comment || "" },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            originalUrl: shareUrl,
            title: { text: title || "" },
            description: { text: description || "" },
          },
        ],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  const postJson = await postRes.json();
  if (!postRes.ok) {
    return NextResponse.json({ error: "Post failed", details: postJson }, { status: postRes.status });
  }

  return NextResponse.json({ success: true, data: postJson });
}
