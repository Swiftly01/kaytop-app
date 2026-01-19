"use client";

import { Label } from "@/app/_components/ui/label";
import { useCustomerFlow } from "../AddCustomerFlowProvider";
import Button from "@/app/_components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { UserService } from "@/app/services/userService";
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/Select";
import { UploadCloud, X } from "lucide-react";


export default function Step1Personal() {
  const [states, setStates] = useState<string[]>([]);
    const [branches, setBranches] = useState<string[]>([]);

    useEffect(() => {
        UserService.getStates().then(setStates);
        UserService.getBranches().then(setBranches);
      }, []);

      const { data, updateField, submitStep1, isCreatingCustomer } = useCustomerFlow();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("profilePicture", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClearPreview = () => {
    setPreview(null);
    updateField("profilePicture", null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isValid =
    data.firstName &&
    data.lastName &&
    data.email &&
    data.mobileNumber && data.state && data.branch;

  return (
    <div>
          <h2 className="text-lg font-semibold">Add New Customer</h2>
    
        <p className="text-sm text-gray-500 mb-6">
          Tell us about your customer. It only takes a few minutes.
        </p>

        {/* Form */}
        <div className="space-y-4">

  {/* First Name */}

  <div className="flex items-center">
    <label className="text-sm font-medium w-40">First name</label>
    <input
      type="text"
      placeholder="e.g. John"
      value={data.firstName}
      onChange={(e) => updateField("firstName", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
   
  </div>

  {/* Last Name */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Last name</label>
    <input
      type="text"
      placeholder="e.g Doe"
      value={data.lastName}
      onChange={(e) => updateField("lastName", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Phone */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Phone Number</label>
    <input
      type="text"
      placeholder="e.g. +234 801 234 5678"
      value={data.mobileNumber}
      onChange={(e) => updateField("mobileNumber", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Email */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">Email Address</label>
    <input
      type="email"
      placeholder="e.g johndoe@example.com"
      value={data.email}
      onChange={(e) => updateField("email", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
{/* Branch */}
<div>
  <label className="text-sm font-medium">Branch</label>
  <Select
    value={data.branch}
    onValueChange={(value) => updateField("branch", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select branch" />
    </SelectTrigger>
    <SelectContent>
      {branches.map((b) => (
        <SelectItem key={b} value={b}>
          {b}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

{/* State */}
<div>
  <label className="text-sm font-medium">State</label>
  <Select
    value={data.state}
    onValueChange={(value) => updateField("state", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
    <SelectContent>
      {states.map((s) => (
        <SelectItem key={s} value={s}>
          {s}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
</div>


  {/* House Address */}
  <div className="flex items-center">
    <label className="text-sm font-medium w-40">House Address</label>
    <input
      type="text"
      placeholder="e.g. 123 Main Street"
      value={data.address}
      onChange={(e) => updateField("address", e.target.value)}
      className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>

  {/* Upload */}
  {/* <div className="flex items-start">
    <label className="text-sm font-medium w-40">Customer's image*</label>

    <div className="flex-1 border border-dashed rounded-lg p-4 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition">
      <button className="p-3 bg-purple-100 rounded-full text-purple-600">📁</button>

      <div>
        <p className="text-sm text-purple-600 font-medium cursor-pointer">Click to upload</p>
        <p className="text-xs text-gray-500">
          or drag and drop SVG, PNG, JPG or GIF (max. 800×400px)
        </p>
      </div>
    </div>
  </div> */}
  <div className="flex items-start">
          <label className="text-sm font-medium w-40 text-foreground">Customer's image*</label>
          <div className="flex-1">
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Customer preview"
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
        <div className="mt-6 flex justify-end gap-3">
         
          <Button onClick={submitStep1}
          disabled={!isValid || isCreatingCustomer}
          variant="tertiary"  className="px-10 py-2 w-1/2  text-white rounded-md text-sm">
            {isCreatingCustomer ? "Creating customer..." : "Continue"}
          </Button>
        </div>
      
    </div>
  );
}

