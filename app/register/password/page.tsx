"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import  Input  from "@/app/_components/ui/input"
import Button from "@/app/_components/ui/Button"

export default function CreatePasswordPage() {
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-7" alt="logo" />
          <span className="font-semibold text-primary">Kaytop MI</span>
        </div>

        <Link href="/login" className="text-sm text-secondary hover:underline">
          Already have an account? <span className="font-semibold">Sign in</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-primary mb-2">Create a password</h2>
      <p className="text-sm text-gray-600 mb-10">
        Secure your account to continue
      </p>

      {/* Password Field */}
      <div className="mb-5">
        <label className="text-sm font-medium text-primary block mb-1">
          Password
        </label>
        <div className="relative">
          <Input
            type={show1 ? "text" : "password"}
            placeholder="Enter your password"
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

      <Button variant="tertiary" fullWidth size="lg">
        Complete Registration
      </Button>

      {/* FOOTER */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Powered by Kaytop |{" "}
        <Link href="/terms" className="hover:underline">Terms & Conditions</Link> |
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </div>
    </div>
  )
}
