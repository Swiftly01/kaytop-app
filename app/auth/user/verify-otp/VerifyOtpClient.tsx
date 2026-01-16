"use client"

import VerifyOtpForm from "@/app/_components/ui/auth/user/VerifyOtpForm";
import { Purpose } from "@/app/types/auth";


export default function VerifyOtpClient() {
  
  return (
        <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      <h1 className="text-3xl font-medium text-neutral-700">
        Verify your email
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter the OTP sent to your email for verification
      </p>

      <VerifyOtpForm />
     
    </div>
  );
}