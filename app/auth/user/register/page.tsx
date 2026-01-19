
import Link from "next/link";
import RegisterForm from "@/app/_components/ui/auth/user/RegisterForm";


export const metadata = {
  title: "Register",
};

export default function RegisterPage() {

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-2xl mt-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
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

      <h2 className="text-3xl font-bold text-primary mb-2">Welcome</h2>
      <p className="text-sm text-gray-600 mb-8">
        Create your account to continue
      </p>

  <RegisterForm />

      {/* FOOTER */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">
          Terms & Conditions
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}






