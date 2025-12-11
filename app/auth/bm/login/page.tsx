import LoginForm from "@/app/_components/ui/auth/LoginForm";
import { JSX } from "react";

export const metadata = {
  title: "Login",
};

export default function page(): JSX.Element {
  return (
    <div className="w-full max-w-lg p-10 mx-5 bg-white rounded-lg">
      <h1 className="text-3xl font-medium text-neutral-700">Hello,</h1>
      <p className="text-md text-neutral-700">Sign in to your account</p>
      <LoginForm />
    </div>
  );
}
