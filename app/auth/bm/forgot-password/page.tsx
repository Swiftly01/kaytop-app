import Button from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import Link from "next/link";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">
        Forgot password?
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter your email, a reset OTP will be sent to you soon
      </p>
      <form action="">
        <div className="mt-5">
          <label htmlFor="email text-md text-neutral-700">Email</label>

          <Input
            type="email"
            placeholder="Enter your username or email"
            id="email"
          />
        </div>

        <div className="mt-6">
          <Button fullWidth={true} variant="tertiary">
            Submit
          </Button>
          <Link
            className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
            href="/"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
