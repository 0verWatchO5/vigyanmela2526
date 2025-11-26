"use client";

import React, { useEffect } from "react";
import { IconX } from "@/components/ui/form-components";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null | undefined;
  userName: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  imageUrl,
  userName,
}: DocumentViewerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Check if imageUrl is valid
  const hasValidImage = imageUrl && imageUrl.trim() !== "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-white drop-shadow-lg">
              ID Card - {userName}
            </h3>
            <p className="text-xs md:text-sm text-white/70">
              {hasValidImage ? "Click outside or press ESC to close" : "No ID card uploaded"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition-all"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {}
        <div className="p-4 md:p-6 max-h-[80vh] overflow-auto bg-white/5 backdrop-blur-sm">
          {hasValidImage ? (
            <img
              src={imageUrl}
              alt={`ID Card of ${userName}`}
              className="w-full h-auto rounded-lg shadow-xl"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 md:w-12 md:h-12 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">No ID Card Available</h4>
              <p className="text-sm md:text-base text-white/70 max-w-md">
                This user registered via LinkedIn authentication and did not upload an ID card.
              </p>
            </div>
          )}
        </div>

        {}
        <div className="p-4 md:p-6 border-t border-white/20 flex justify-between items-center bg-white/5 backdrop-blur-sm">
          {hasValidImage ? (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              Open in new tab
            </a>
          ) : (
            <span className="text-sm text-white/50">LinkedIn authenticated user</span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl text-sm font-medium transition-all text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
