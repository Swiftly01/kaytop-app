import Button from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Create new password
      </h1>
      <p className="text-md text-neutral-700">
        Create a new password for your Kaytop account.
      </p>

      <form action="">
        <div className="my-6">
          <label className="text-md text-neutral-700" htmlFor="new_password">
            New Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            id="new_password"
          />

          <label className="text-md text-neutral-700" htmlFor="new_password">
            Confirm Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            id="confirm_password"
          />
        </div>

        <Button fullWidth={true} variant="tertiary">
          Submit
        </Button>
      </form>
    </div>
  );
}
