"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security">("profile");

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex gap-10">
        {/* Left menu */}
        <div className="w-56">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>

          <div className="flex flex-col gap-2 text-sm">
            <button
              onClick={() => setTab("profile")}
              className={`text-left px-3 py-2 rounded ${
                tab === "profile"
                  ? "bg-violet-100 text-violet-700 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              Personal details
            </button>

            <button
              onClick={() => setTab("security")}
              className={`text-left px-3 py-2 rounded ${
                tab === "security"
                  ? "bg-violet-100 text-violet-700 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {tab === "profile" ? <ProfileTab /> : <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

/* =========================
   PROFILE TAB (PUT IT HERE)
   ========================= */
function ProfileTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold">Personal details</h3>
        <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
          Edit Profile
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <img
          src="/avatar.jpg"
          alt="avatar"
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">Anderson</p>
          <p className="text-sm text-gray-500">
            admin@kaytopfinance.com
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
        <Detail label="Name" value="Anderson" />
        <Detail label="Date of birth" value="18th May, 2000" />
        <Detail label="Email" value="admin@kaytopfinance.com" />
        <Detail label="Phone number" value="+234 813 456 7890" />
        <Detail label="State" value="Lagos" />
        <Detail label="Branch Name" value="Oshodi South" />
      </div>
    </div>
  );
}

/* =========================
   SECURITY TAB
   ========================= */
function SecurityTab() {
  return (
    <div className="max-w-md">
      <h3 className="text-base font-semibold mb-6">Security</h3>

      <div className="space-y-4 text-sm">
        <Input label="Current Password" />
        <Input label="New Password" />
        <Input label="Confirm Password" />
      </div>

      <button className="mt-6 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700">
        Update Password
      </button>
    </div>
  );
}

/* =========================
   SMALL HELPERS
   ========================= */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Input({ label }: { label: string }) {
  return (
    <div>
      <label className="block mb-1 text-gray-600">{label}</label>
      <input
        type="password"
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}
