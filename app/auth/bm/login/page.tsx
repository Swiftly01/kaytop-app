import Button from "@/app/_components/ui/Button";
import { Checkbox } from "@/app/_components/ui/Checkbox";
import { Input } from "@/app/_components/ui/input";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <div className="max-w-lg  w-full bg-white p-10 rounded-lg mx-5">
      <h1 className="text-2xl font-medium">Hello,</h1>
      <p className="text-md">Sign in to your account</p>

      <form className="my-2" action="">
        <label htmlFor="email">Email</label>
        <Input type="email" placeholder="Enter your email" id="email" />

        <label htmlFor="password">password</label>
        <Input
          type="password"
          placeholder="Enter your password"
          id="password"
        />
        <div className="flex justify-between my-4">
          <div className="flex items-center gap-3">
            <Checkbox id="terms" />
            <label htmlFor="terms text-sm">Keep me signed in</label>
          </div>
          <Link href="/" className="text-sm text-accent">
            Forgot password?
          </Link>
        </div>

        <Button fullWidth={true} variant="tertiary">
          Sign In
        </Button>
      </form>
    </div>
  );
}
