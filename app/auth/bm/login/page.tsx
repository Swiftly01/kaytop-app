"use client";

import LoginForm from "@/app/_components/ui/auth/LoginForm";
import { JSX, useEffect, useState } from "react";

export const metadata = {
  title: "Login",
};

export default function page(): JSX.Element {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
        <h1 className="text-3xl font-medium text-neutral-700">Hello,</h1>
        <p className="text-md text-neutral-700">Sign in to your account</p>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">Hello,</h1>
      <p className="text-md text-neutral-700">Sign in to your account</p>
      <LoginForm />
    </div>
  );
}
