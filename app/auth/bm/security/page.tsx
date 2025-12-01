import Button from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/input";
import React, { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Security Verification
      </h1>
      <p className="text-neutral-700 text-md">
        To secure your account please verify it’s you
      </p>
      <form action="">
        <div className="my-7">
          <p className="text-md">Enter the code sent to 0813****979</p>

          <Input
            type="email"
            placeholder="Mobile verification code"
            id="email"
          />
        </div>

        <Button fullWidth={true} variant="tertiary">
          Sign In
        </Button>
      </form>
    </div>
  );
}
