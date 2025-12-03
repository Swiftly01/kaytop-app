import Button from "@/app/_components/ui/Button";
import OtpInput from "@/app/_components/ui/OtpInput";
import Link from "next/link";
import React, { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">Verify OTP</h1>
      <p className="mt-2 text-md text-neutral-500">
        Enter the 6-digit code sent to your email
      </p>

      <form className="my-6" action="">
        <OtpInput />

        <div className="mt-6">
          <Button fullWidth={true} variant="tertiary">
            Verify Code
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-500">
            Didn't receive the code?{" "}
            <Link href="#" className="text-accent">
              Resend
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
