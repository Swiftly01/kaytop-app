
import Link from "next/link";
import LoginForm from "@/app/_components/ui/auth/user/LoginForm";


export const metadata = {
  title: "Login",
};


export default function AgentLoginPage() {

  return (
    <div>
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link href="/auth/user/register" className="text-sm text-secondary hover:underline">
          Don’t have an account? <span className="font-semibold">Sign Up</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Welcome back</h2>
      <p className="text-sm text-gray-600 mb-6">
        Sign in to your account to continue
      </p>

      <LoginForm />

</div>
      {/* FOOTER */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">Terms & Conditions</Link> |
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
}

