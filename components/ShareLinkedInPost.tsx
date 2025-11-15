"use client";
import React, { useEffect, useState } from "react";

type ShareLinkedInPostProps = {
  shareUrl: string;
  title?: string;
  description?: string;
  defaultComment?: string;
};

type PostMode = "link" | "image";

export default function ShareLinkedInPost({ shareUrl, title, description, defaultComment }: ShareLinkedInPostProps) {
  const [comment, setComment] = useState(defaultComment || "Excited to share this!");
  const [mode, setMode] = useState<PostMode>("link");
  const [linkUrl, setLinkUrl] = useState(shareUrl);
  const [imageUrl, setImageUrl] = useState("");
  const [headline, setHeadline] = useState(title || "");
  const [summary, setSummary] = useState(description || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLinkUrl(shareUrl);
  }, [shareUrl]);

  useEffect(() => {
    if (title !== undefined) {
      setHeadline(title);
    }
  }, [title]);

  useEffect(() => {
    if (description !== undefined) {
      setSummary(description);
    }
  }, [description]);

  async function handlePost() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        comment,
        title: headline,
        description: summary,
      };

      const trimmedLink = linkUrl.trim();
      if (mode === "link") {
        if (!trimmedLink) {
          throw new Error("Share URL is required for link posts.");
        }
        payload.shareUrl = trimmedLink;
      } else {
        const trimmedImage = imageUrl.trim();
        if (!trimmedImage) {
          throw new Error("Image URL is required for image posts.");
        }
        payload.imageUrl = trimmedImage;
        if (trimmedLink) {
          payload.shareUrl = trimmedLink;
        }
      }

      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Post failed");
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const isImageMode = mode === "image";

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-md border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Direct LinkedIn Post</h3>
          <p className="text-xs text-muted-foreground">Publishes immediately with your LinkedIn access (requires w_member_social scope).</p>
        </div>
        <div className="flex overflow-hidden rounded-md border text-xs">
          <button
            type="button"
            className={`px-2 py-1 transition ${mode === "link" ? "bg-blue-600 text-white" : "bg-background"}`}
            onClick={() => setMode("link")}
            disabled={loading}
          >
            Link
          </button>
          <button
            type="button"
            className={`px-2 py-1 transition ${mode === "image" ? "bg-blue-600 text-white" : "bg-background"}`}
            onClick={() => setMode("image")}
            disabled={loading}
          >
            Image
          </button>
        </div>
      </div>

      <label className="text-xs font-medium text-muted-foreground">Commentary</label>
      <textarea
        className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add commentary"
      />

      <label className="text-xs font-medium text-muted-foreground">Headline</label>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
        placeholder="Post headline"
      />

      <label className="text-xs font-medium text-muted-foreground">Summary</label>
      <textarea
        className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
        rows={2}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Optional description"
      />

      <label className="text-xs font-medium text-muted-foreground">Share URL (optional for image)</label>
      <input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
        placeholder="https://example.com/page"
        disabled={loading}
      />

      {isImageMode && (
        <>
          <label className="text-xs font-medium text-muted-foreground">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground">Provide a publicly accessible image URL (LinkedIn downloads the asset before posting).</p>
        </>
      )}

      <button
        onClick={handlePost}
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : `Post ${isImageMode ? "Image" : "Link"} to LinkedIn`}
      </button>

      {error && <div className="text-xs text-red-500">{error}</div>}
      {result && (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 p-2 text-xs text-green-600">
          <p>Post request accepted.</p>
          {result.assetUrn && <p>Asset: {result.assetUrn}</p>}
          {result.data?.id && <p>URN: {result.data.id}</p>}
        </div>
      )}
    </div>
  );
}
