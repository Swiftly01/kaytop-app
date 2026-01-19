import ResetPasswordForm from "@/app/_components/ui/auth/user/ResetPasswordForm";
import Link from "next/link";
import { JSX } from "react";

export const metadata = {
  title: "Reset password"
}

export default function page(): JSX.Element {
  return (
        <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
       {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link
          href="/auth/user/login"
          className="text-sm text-secondary hover:underline"
        >
          Already have an account?{" "}
          <span className="font-semibold">Sign in</span>
        </Link>
      </div>

      <h1 className="text-3xl font-medium text-neutral-700">
        Create new password
      </h1>
      <p className="text-md text-neutral-700">
        Create a new password for your Kaytop account.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
