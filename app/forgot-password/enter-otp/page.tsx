"use client";

import Link from "next/link";
import { Label } from "../../_components/ui/label";
import Button from "../../_components/ui/Button";
import { Input } from "@/components/ui/input";

export default function EnterOtpPage() {
  return (
    <div className=" flex flex-col justify-center items-center px-3">

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-primary">Enter OTP</h2>
        <p className="text-gray-500 text-sm mt-2 mb-8">
          We’ve sent you an OTP code, kindly enter it below
        </p>

        {/* OTP Field */}
        <div className="mb-6">
          <Label htmlFor="otp" className="text-sm text-gray-700">
            Enter OTP
          </Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            className="mt-1"
          />
        </div>

        {/* Continue */}
        <Button className="w-full py-3" variant="tertiary">
          Continue
        </Button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center mt-8">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">
          Terms & Conditions
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
