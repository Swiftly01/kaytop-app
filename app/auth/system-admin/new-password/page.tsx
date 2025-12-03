import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";
import React, { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">Create New Password</h1>
      <p className="mt-2 text-md text-neutral-500">
        Your new password must be different from previously used passwords
      </p>

      <form className="my-6" action="">
        <label htmlFor="password">New Password</label>
        <Input
          type="password"
          placeholder="Enter new password"
          id="password"
        />

        <label htmlFor="confirmPassword" className="mt-4">
          Confirm Password
        </label>
        <Input
          type="password"
          placeholder="Confirm new password"
          id="confirmPassword"
        />

        <div className="mt-6">
          <Button fullWidth={true} variant="tertiary">
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  );
}
