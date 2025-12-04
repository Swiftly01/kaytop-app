"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "../_components/ui/label";
import Button from "../_components/ui/Button";
import { Input } from "@/components/ui/input";
// import Input from "../_components/ui/input";


export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link href="/register" className="text-sm text-secondary hover:underline">
          Don’t have an account? <span className="font-semibold">Sign Up</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Welcome back</h2>
      <p className="text-sm text-gray-600 mb-6">
        Sign in to your account to continue
      </p>

      {/* EMAIL */}
      <div className="mb-4">
        <Label className="font-normal text-base text-muted-foreground" htmlFor="email">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="mt-1"
        />
      </div>

      {/* PASSWORD */}        
         <div className="flex items-center justify-between">
                <Label className="font-normal text-base text-muted-foreground" htmlFor="password">
          Password
        </Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
        <div className="relative mt-1">
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-5 text-gray-500"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

      {/* FORGOT + REMEMBER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input id="keepSigned" type="checkbox" className="h-4 w-4 accent-[#7f56d9]" />
          <Label htmlFor="keepSigned" className="text-sm text-gray-600">
            Keep me signed in
          </Label>
        </div>
      </div>

      {/* SUBMIT */}
      <Button variant="tertiary" fullWidth size="lg">
        Continue
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

