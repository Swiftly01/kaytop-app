"use client";
import Button from "@/app/_components/ui/Button";
import React, { useRef, useState } from "react";
import { useCustomerFlow } from "../AddCustomerFlowProvider";
import { UploadCloud, X } from "lucide-react";

export default function Step2Guarantor() {
   const { data, updateField, submitStep2, prevStep, isUpdatingGuarantor } = useCustomerFlow();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
   const isValid =
    data.guarantorName &&
    data.guarantorPhone &&
    data.guarantorRelationship &&
    data.guarantorPicture;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("guarantorPicture", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClearPreview = () => {
    setPreview(null);
    updateField("guarantorPicture", null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
              <h2 className="text-lg font-semibold">Guarantor Details</h2>
        
            <p className="text-sm text-gray-500 mb-6">
              Tell us about your guarantor. It only takes a few minutes.
            </p>
    
            {/* Form */}
            <div className="space-y-4">
    
      {/* First Name */}
      <div className="flex items-center">
        <label className="text-sm font-medium w-40">Guarantor name</label>
        <input
          type="text"
          placeholder="e.g. Jane Smith"
          value={data.guarantorName}
          onChange={(e) => updateField("guarantorName", e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>
    
      {/* Relationship */}
      <div className="flex items-center">
        <label className="text-sm font-medium w-40">Relationship</label>
        <input
          type="text"
          placeholder="e.g Siblings"
          value={data.guarantorRelationship}
          onChange={(e) => updateField("guarantorRelationship", e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>
    
      {/* Phone */}
      <div className="flex items-center">
        <label className="text-sm font-medium w-40">Phone Number</label>
        <input
          type="text"
          placeholder="e.g. +234 801 234 5678"
          value={data.guarantorPhone}
          onChange={(e) => updateField("guarantorPhone", e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>
    
      {/* Email */}
      <div className="flex items-center">
        <label className="text-sm font-medium w-40">Email Address</label>
        <input
          type="email"
          placeholder="e.g. jane@example.com"
          value={data.guarantorEmail}
          onChange={(e) => updateField("guarantorEmail", e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>
    
      {/* House Address */}
      <div className="flex items-center">
        <label className="text-sm font-medium w-40">House Address</label>
        <input
          type="text"
          placeholder="e.g. 456 Oak Avenue"
          value={data.guarantorAddress}
          onChange={(e) => updateField("guarantorAddress", e.target.value)}
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>
    
      {/* Upload */}
       <div className="flex items-start">
          <label className="text-sm font-medium w-40 text-foreground">Guarantor's image*</label>
          <div className="flex-1">
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Guarantor preview"
                  className="w-24 h-24 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={handleClearPreview}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 flex items-center gap-3 bg-[hsl(220,14%,96%)]/50 hover:bg-[hsl(220,14%,96%)] transition cursor-pointer"
              >
                <div className="p-3 bg-[hsl(262,83%,58%)]/10 rounded-full text-[hsl(262,83%,58%)]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(262,83%,58%)] font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
    </div>
    
    
            {/* Footer Buttons */}
            <div className="mt-6 flex justify-between gap-3">
              <Button
                onClick={prevStep}
                variant="secondary"
                className="px-4 bg-gray-200 w-full py-2 border rounded-md text-sm "
              >
                Back
              </Button>
              <Button onClick={submitStep2}
              disabled={!isValid || isUpdatingGuarantor}
              variant="tertiary"  className="px-10 w-full py-2  text-white rounded-md text-sm ">
                {isUpdatingGuarantor ? "Saving guarantor..." : "Continue"}
              </Button>
            </div>
          
        </div>
  );
}
