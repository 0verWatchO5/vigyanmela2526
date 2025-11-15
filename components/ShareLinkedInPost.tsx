"use client";
import React, { useState } from "react";

type ShareLinkedInPostProps = {
  shareUrl: string;
  title?: string;
  description?: string;
  defaultComment?: string;
};

export default function ShareLinkedInPost({ shareUrl, title, description, defaultComment }: ShareLinkedInPostProps) {
  const [comment, setComment] = useState(defaultComment || "Excited to share this!");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, shareUrl, title, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Post failed");
      setResult(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl border p-4 rounded-md bg-background">
      <h3 className="text-lg font-semibold">Direct LinkedIn Post</h3>
      <p className="text-xs text-muted-foreground">Creates a LinkedIn post immediately (requires w_member_social scope). Users won't edit before publish.</p>
      <textarea
        className="w-full rounded-md border border-border bg-transparent p-2 text-sm"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add commentary"
      />
      <button
        onClick={handlePost}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post to LinkedIn"}
      </button>
      {error && <div className="text-red-500 text-xs">{error}</div>}
      {result && (
        <div className="text-xs text-green-600">
          Posted! URN: {result.id || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
