"use client";

import React from "react";
import { IconX } from "@/components/ui/form-components";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  imageUrl,
  userName,
}: DocumentViewerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-background rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              ID Card - {userName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Click outside or press ESC to close
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {}
        <div className="p-4 max-h-[80vh] overflow-auto">
          <img
            src={imageUrl}
            alt={`ID Card of ${userName}`}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>

        {}
        <div className="p-4 border-t border-border flex justify-between items-center">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:text-blue-400 underline"
          >
            Open in new tab
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
