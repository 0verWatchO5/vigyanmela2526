"use client";

import React, { useState, useRef, useEffect } from "react";
import { InputHoverGradient, IconUpload, IconFile, IconX } from "./form-components";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string;
}

export const Input = ({ id, error, className, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <div className="group relative w-full">
        <input
          id={id}
          className={cn(
            // FIXED: Changed bg-zinc-800 to adaptive colors
            "flex h-10 w-full rounded-md border-none px-3 py-2 text-sm",
            "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white", 
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900",
            "placeholder:text-muted-foreground",
            "shadow-input dark:shadow-[0px_0px_1px_1px_#262626]",
            error && "ring-2 ring-red-500",
            className
          )}
          {...props}
        />
        <InputHoverGradient />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

interface FileUploadProps {
  id: string;
  name: string;
  accept: string;
  onChange: (files: File[]) => void;
  error?: string;
  maxSize?: number;
  files?: File[];
}

export const FileUpload = ({
  id,
  name,
  accept,
  onChange,
  error,
  maxSize = 20,
  files = [],
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (files.length === 0) {
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [files]);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setUploadedFile(file);
      onChange([file]);
    }
  };

  // ... (Drag and drop handlers remain the same) ...
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (fileInputRef.current) fileInputRef.current.files = files;
    handleFiles(files);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { handleFiles(e.target.files); };
  const handleClick = () => { fileInputRef.current?.click(); };
  const handleRemoveFile = () => {
    setUploadedFile(null);
    onChange([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="group relative w-full">
        <div
          className={cn(
            "w-full p-6 border border-dashed rounded-lg cursor-pointer text-center",
            "border-border bg-background", // Uses adaptive background
            "transition-colors duration-200",
            isDragging
              ? "border-blue-500 bg-zinc-100 dark:bg-zinc-800"
              : "hover:border-neutral-500",
            error && "border-red-500"
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" id={id} name={name} accept={accept} ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

          {!uploadedFile ? (
            <div className="flex flex-col items-center gap-2">
              <IconUpload className="h-8 w-8" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">{accept.split(",").join(", ")} (Max {maxSize}MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconFile className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors">
                <IconX className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <InputHoverGradient />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};