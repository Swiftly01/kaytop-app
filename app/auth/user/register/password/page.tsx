"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Button from "@/app/_components/ui/Button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { AuthService } from "@/app/services/authService"
import { Purpose } from "@/app/types/auth"

export default function CreatePasswordPage() {
  const router = useRouter();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    const data = JSON.parse(sessionStorage.getItem("register_data") || "{}");

    // Validate mobile number
    const isValidNigeriaNumber = (num: string) =>
      /^(?:\+234|234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/.test(num);

    if (!isValidNigeriaNumber(data.mobileNumber || "")) {
      setError("Invalid Nigerian phone number");
      return;
    }


    try {
      setLoading(true);
      setError("");

      await AuthService.signup({
        ...data,
        password,
        mobileNumber: data.mobileNumber,
      });

      await AuthService.sendOtp({ email: data.email, purpose: Purpose.Email_verification });

      router.push(`/auth/user/verify-otp?email=${data.email}&purpose=email_verification`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link href="/auth/user/login" className="text-sm text-secondary hover:underline">
          Already have an account? <span className="font-semibold">Sign in</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Create a password</h2>
      <p className="text-sm text-gray-600 mb-10">
        Secure your account to continue
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Password Field */}
      <div className="mb-5">
        <label className="text-sm font-medium text-primary block mb-1">
          Password
        </label>
        <div className="relative">
          <Input
            type={show1 ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow1(!show1)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="mb-10">
        <label className="text-sm font-medium text-primary block mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            type={show2 ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow2(!show2)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        variant="tertiary"
        fullWidth
        size="lg"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Complete Registration"}
      </Button>

      {/* FOOTER */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">Terms & Conditions</Link> |
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
}


