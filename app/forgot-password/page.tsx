"use client";

import Link from "next/link";
import { Label } from "../_components/ui/label";
import Button from "../_components/ui/Button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className=" flex flex-col justify-center items-center px-3">

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md">
        {/* Title + subtitle */}
        <h2 className="text-2xl font-bold text-primary">Forgot password?</h2>
        <p className="text-gray-500 text-sm mt-2 mb-8">
          Please enter your email, a reset OTP will be sent to you soon
        </p>

        {/* Email Field */}
        <div className="mb-6">
          <Label htmlFor="email" className="text-sm text-gray-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your username or email"
            className="mt-1"
          />
        </div>

        {/* CTAs */}
        <Link href="/forgot-password/enter-otp" className="block">
        <Button className="w-full py-3 mb-4" variant="tertiary">
          Continue
        </Button>
        </Link>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Cancel
          </Link>
        </div>
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
