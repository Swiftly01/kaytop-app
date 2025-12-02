"use client";
import Button from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import OtpInput from "@/app/_components/ui/OtpInput";
import React from "react";

export default function page() {
  function handleOtp() {}
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Verify your email
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter the OTP sent to your email for verification
      </p>
      <form action="">
        <div className="my-6">
          <label htmlFor="OTP">Enter OTP</label>

          <OtpInput onComplete={handleOtp} />
        </div>

        <Button fullWidth={true} variant="tertiary">
          Submit
        </Button>
      </form>
    </div>
  );
}
