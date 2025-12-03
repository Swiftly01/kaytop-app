import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";
import Link from "next/link";
import React, { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">Forgot Password?</h1>
      <p className="mt-2 text-md text-neutral-500">
        Enter your email address and we'll send you a code to reset your password
      </p>

      <form className="my-6" action="">
        <label htmlFor="email">Email</label>
        <Input type="email" placeholder="Enter your email" id="email" />

        <div className="mt-6">
          <Button fullWidth={true} variant="tertiary">
            Send Reset Code
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/auth/system-admin/login" className="text-sm text-accent">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
