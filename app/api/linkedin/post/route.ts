import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type UploadRegistration = {
  uploadUrl: string;
  assetUrn: string;
  headers: Record<string, string>;
};

async function fetchPersonUrn(accessToken: string) {
  const meRes = await fetch("https://api.linkedin.com/v2/me", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) {
    const txt = await meRes.text();
    throw new Error(`Failed to fetch profile: ${txt}`);
  }
  const me = await meRes.json();
  if (!me?.id) {
    throw new Error("LinkedIn profile response did not include an id");
  }
  return `urn:li:person:${me.id}`;
}

async function registerImageUpload(accessToken: string, ownerUrn: string): Promise<UploadRegistration> {
  const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: ownerUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
        supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
      },
    }),
  });

  if (!registerRes.ok) {
    const details = await registerRes.text();
    throw new Error(`LinkedIn register upload failed: ${details}`);
  }

  const payload = await registerRes.json();
  const mediaUpload = payload?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"];
  const assetUrn = payload?.value?.asset as string | undefined;

  if (!mediaUpload?.uploadUrl || !assetUrn) {
    throw new Error("LinkedIn register upload response missing uploadUrl or asset URN");
  }

  const headers: Record<string, string> = {};
  if (mediaUpload.headers && typeof mediaUpload.headers === "object") {
    Object.entries(mediaUpload.headers as Record<string, unknown>).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      headers[key] = Array.isArray(value) ? value.filter(Boolean).join(",") : String(value);
    });
  }

  return {
    uploadUrl: mediaUpload.uploadUrl as string,
    assetUrn,
    headers,
  };
}

async function downloadImage(imageUrl: string) {
  const res = await fetch(imageUrl, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch image: ${txt}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType, contentLength: buffer.byteLength };
}

async function uploadImageToLinkedIn(registration: UploadRegistration, payload: { buffer: Uint8Array; contentType: string; contentLength?: number }) {
  const headers: Record<string, string> = {
    ...registration.headers,
    "Content-Type": payload.contentType,
  };

  if (payload.contentLength !== undefined && !Number.isNaN(payload.contentLength)) {
    headers["Content-Length"] = String(payload.contentLength);
  }

  const body: ArrayBuffer =
    payload.buffer.byteOffset === 0 && payload.buffer.byteLength === payload.buffer.buffer.byteLength
      ? (payload.buffer.buffer as ArrayBuffer)
      : (payload.buffer.buffer.slice(
          payload.buffer.byteOffset,
          payload.buffer.byteOffset + payload.buffer.byteLength
        ) as ArrayBuffer);

  const uploadRes = await fetch(registration.uploadUrl, {
    method: "PUT",
    headers,
    body,
  });

  if (!uploadRes.ok) {
    const txt = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed: ${txt}`);
  }
}
async function submitLinkedInPost(accessToken: string, body: Record<string, unknown>) {
  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  const json = await postRes.json();
  if (!postRes.ok) {
    throw new Error(`LinkedIn post failed: ${JSON.stringify(json)}`);
  }

  return json;
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comment, shareUrl, title, description, imageUrl } = await req.json();
    if (!shareUrl && !imageUrl) {
      return NextResponse.json({ error: "Either shareUrl or imageUrl is required" }, { status: 400 });
    }

    const personUrn = await fetchPersonUrn(session.accessToken as string);

    if (imageUrl) {
      const registration = await registerImageUpload(session.accessToken as string, personUrn);
      const imagePayload = await downloadImage(imageUrl);
      await uploadImageToLinkedIn(registration, imagePayload);

      const postBody = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: comment || "" },
            shareMediaCategory: "IMAGE",
            media: [
              {
                status: "READY",
                media: registration.assetUrn,
                title: { text: title || "" },
                description: { text: description || "" },
                ...(shareUrl ? { landingPageUrl: shareUrl } : {}),
              },
            ],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const postJson = await submitLinkedInPost(session.accessToken as string, postBody);
      return NextResponse.json({ success: true, data: postJson, assetUrn: registration.assetUrn });
    }

    const postBody = {
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

    const postJson = await submitLinkedInPost(session.accessToken as string, postBody);
    return NextResponse.json({ success: true, data: postJson });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "LinkedIn post failed" }, { status: 500 });
  }
}
