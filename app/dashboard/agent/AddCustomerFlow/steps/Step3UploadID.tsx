"use client";

import React, { useRef, useState } from "react";
import Button from "@/app/_components/ui/Button";
import { UploadCloud, X } from "lucide-react";

interface Step3UploadIDProps {
  onNext: () => void;
  onBack: () => void;
  onCapture: (file: File) => void;
  openCamera: () => void;
}

export default function Step3UploadID({
  onNext,
  onBack,
  onCapture,
  openCamera,
}: Step3UploadIDProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileSelected(file);
    setPreview(URL.createObjectURL(file));
    onCapture(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClearPreview = () => {
    setPreview(null);
    setFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClickToCapture = () => {
    openCamera();
  };

  const handleContinue = () => {
    if (fileSelected) {
      onNext();
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-foreground">Verify Your ID</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Tell us about your customer. It only takes a few minutes.
      </p>

      <div className="mt-6 bg-card rounded-xl border border-border p-5">
        <p className="text-sm font-semibold text-foreground mb-4">Valid Government ID</p>

        <div className="flex items-start gap-4">
          {/* Upload Icon */}
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center shrink-0 bg-[hsl(220,14%,96%)]">
            <UploadCloud className="w-5 h-5 text-[hsl(215,16%,47%)]" />
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                isDragging
                  ? "border-[hsl(262,83%,58%)] bg-[hsl(262,83%,58%)]/5"
                  : "border-border hover:border-[hsl(262,83%,58%)]/50 hover:bg-[hsl(220,14%,96%)]/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <p className="text-sm text-foreground">
                  <button
                    type="button"
                    onClick={handleClickToCapture}
                    className="text-[hsl(262,83%,58%)] font-medium hover:underline"
                  >
                    Click to Capture
                  </button>
                  {" or "}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-[hsl(262,83%,58%)] font-medium hover:underline"
                  >
                    drag and drop
                  </button>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG or GIF (max. 800×400px)
                </p>
              </div>
              <input
                type="file"
                ref={inputRef}
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="mt-5 relative">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
            <div className="relative inline-block">
              <img
                src={preview}
                alt="ID Preview"
                className="w-48 h-32 object-cover rounded-lg border border-border"
              />
              <button
                onClick={handleClearPreview}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
       <div className="flex justify-between mt-6 gap-3">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1 py-2 bg-gray-200 text-sm"
        >
          Cancel
        </Button>

        <Button
          onClick={handleContinue}
          variant="tertiary"
          disabled={!fileSelected}
          className="flex-1  text-sm py-2"
        >
          Continue
        </Button>
        </div>

  
    </div>
  );
}
