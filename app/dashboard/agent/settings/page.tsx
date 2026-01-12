// "use client";

// import { useState } from "react";

// export default function SettingsPage() {
//   const [tab, setTab] = useState<"profile" | "security">("profile");

//   return (
//     <div className="bg-white rounded-lg border p-6">
//       <div className="flex gap-10">
//         {/* Left menu */}
//         <div className="w-56">
//           <h2 className="text-lg font-semibold mb-4">Settings</h2>

//           <div className="flex flex-col gap-2 text-sm">
//             <button
//               onClick={() => setTab("profile")}
//               className={`text-left px-3 py-2 rounded ${
//                 tab === "profile"
//                   ? "bg-violet-100 text-violet-700 font-medium"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Personal details
//             </button>

//             <button
//               onClick={() => setTab("security")}
//               className={`text-left px-3 py-2 rounded ${
//                 tab === "security"
//                   ? "bg-violet-100 text-violet-700 font-medium"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Security
//             </button>
//           </div>
//         </div>

//         {/* Right content */}
//         <div className="flex-1">
//           {tab === "profile" ? <ProfileTab /> : <SecurityTab />}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    PROFILE TAB (PUT IT HERE)
//    ========================= */
// function ProfileTab() {
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-base font-semibold">Personal details</h3>
//         <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
//           Edit Profile
//         </button>
//       </div>

//       <div className="flex items-center gap-4 mb-8">
//         <img
//           src="/avatar.jpg"
//           alt="avatar"
//           className="h-14 w-14 rounded-full object-cover"
//         />
//         <div>
//           <p className="font-medium">Anderson</p>
//           <p className="text-sm text-gray-500">
//             admin@kaytopfinance.com
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
//         <Detail label="Name" value="Anderson" />
//         <Detail label="Date of birth" value="18th May, 2000" />
//         <Detail label="Email" value="admin@kaytopfinance.com" />
//         <Detail label="Phone number" value="+234 813 456 7890" />
//         <Detail label="State" value="Lagos" />
//         <Detail label="Branch Name" value="Oshodi South" />
//       </div>
//     </div>
//   );
// }

// /* =========================
//    SECURITY TAB
//    ========================= */
// function SecurityTab() {
//   return (
//     <div className="max-w-md">
//       <h3 className="text-base font-semibold mb-6">Security</h3>

//       <div className="space-y-4 text-sm">
//         <Input label="Current Password" />
//         <Input label="New Password" />
//         <Input label="Confirm Password" />
//       </div>

//       <button className="mt-6 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700">
//         Update Password
//       </button>
//     </div>
//   );
// }

// /* =========================
//    SMALL HELPERS
//    ========================= */
// function Detail({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-gray-400 mb-1">{label}</p>
//       <p className="font-medium">{value}</p>
//     </div>
//   );
// }

// function Input({ label }: { label: string }) {
//   return (
//     <div>
//       <label className="block mb-1 text-gray-600">{label}</label>
//       <input
//         type="password"
//         className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
//       />
//     </div>
//   );
// }

"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { SettingsService } from "@/app/services/settingsService";
import Button from "@/app/_components/ui/Button";
import { AuthService } from "@/app/services/authService";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";


interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  state: string;
  branch: string;
  dob?: string | null;
  profilePicture?: string | null;
}


export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security">("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newFirstName, setNewFirstName] = useState(profile?.firstName || "");
const [newLastName, setNewLastName] = useState(profile?.lastName || "");
const [newDob, setNewDob] = useState(profile?.dob || "");
const [newMobileNumber, setNewMobileNumber] = useState(profile?.mobileNumber || "");
const [saving, setSaving] = useState(false);


  /** Password state */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  /** Load profile */
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await SettingsService.getMyProfile();
        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          state: data.state,
          branch: data.branch,
          dob: data.dob,
          profilePicture: data.profilePicture,
        });
        setNewFirstName(data.firstName);
        setNewLastName(data.lastName);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading...</div>;
  }

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
          {tab === "profile" ? (
              profile && (
            <ProfileTab
              profile={profile}
              editing={editing}
              setEditing={setEditing}
              newFirstName={newFirstName}
              setNewFirstName={setNewFirstName}
              newLastName={newLastName}
              newDob={newDob}
              setNewDob={setNewDob}
              newMobileNumber={newMobileNumber}
              setNewMobileNumber={setNewMobileNumber}
              setNewLastName={setNewLastName}
              avatarFile={avatarFile}
              setAvatarFile={setAvatarFile}
              setProfile={setProfile}
            />
              )
          ) : (
            <SecurityTab
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmNewPassword={confirmNewPassword}
              setConfirmNewPassword={setConfirmNewPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   PROFILE TAB
   ========================= */
function ProfileTab({
  profile,
  editing,
  setEditing,
  newFirstName,
  setNewFirstName,
  newLastName,
  setNewLastName,
  newDob,
  setNewDob,
  newMobileNumber,
  setNewMobileNumber,
  avatarFile,
  setAvatarFile,
  setProfile,
}: {
  profile: Profile;
  editing: boolean;
  setEditing: (v: boolean) => void;
  newFirstName: string;
  setNewFirstName: (v: string) => void;
  newLastName: string;
  setNewLastName: (v: string) => void;
  newDob: string;
  setNewDob: (v: string) => void;
  newMobileNumber: string;
  setNewMobileNumber: (v: string) => void;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  setProfile: (p: Profile) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
      setSaving(true);
    try {
      const updatedProfile = await SettingsService.updateProfile({
        firstName: newFirstName,
        lastName: newLastName,
        mobileNumber: newMobileNumber,
        dob: newDob,
        email: profile.email, 
      });
      setProfile({ ...profile, ...updatedProfile });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to update profile. Try again.");
    } finally {
    setSaving(false);
  }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setAvatarFile(file);

    try {
      const res = await SettingsService.uploadAvatar(file);
       setProfile({ ...profile, profilePicture: res.profilePicture });
    } catch (err) {
      console.error("Failed to upload avatar", err);
      toast.error("Failed to upload avatar. Try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold">Personal details</h3>
    
      </div>

<div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <img
          src={profile.profilePicture || "/avatar.jpg"}
          alt="avatar"
          className="h-14 w-14 rounded-full object-cover"
        />
        {/* Pencil overlay */}
        <label className="  text-xs text-violet-600 cursor-pointer underline">
            Edit Profile Picture
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
      </div>
          {!editing ? (
          <button
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
        </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
  {/* First Name */}
  {editing ? (
    <>
      <div>
        <p className="text-gray-400 mb-1">First Name</p>
        <input
          type="text"
          value={newFirstName}
          onChange={(e) => setNewFirstName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-gray-400 mb-1">Last Name</p>
        <input
          type="text"
          value={newLastName}
          onChange={(e) => setNewLastName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-gray-400 mb-1">Date of Birth</p>
        <input
          type="date"
          value={newDob}
          onChange={(e) => setNewDob(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-gray-400 mb-1">Phone Number</p>
        <input
          type="text"
          value={newMobileNumber}
          onChange={(e) => setNewMobileNumber(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  ) : (
    <>
      <Detail label="Name" value={`${profile.firstName} ${profile.lastName}`} />
      <Detail label="Date of birth" value={profile.dob || "N/A"} />
      <Detail label="Phone number" value={profile.mobileNumber} />
    </>
  )}

  {/* Always visible */}
  <Detail label="Email" value={profile.email} />
  <Detail label="State" value={profile.state} />
  <Detail label="Branch Name" value={profile.branch} />
</div>

    </div>
  );

 
}


/* =========================
   SECURITY TAB
   ========================= */
function SecurityTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
}: {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (v: string) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    setError("");
     setLoading(true);

    try {
      await AuthService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(err);
      setError("Failed to change password");
    }finally {
    setLoading(false);
  }
  }

  return (
    <div className="max-w-md">
      <h3 className="text-base font-semibold mb-6">Security</h3>

      <div className="space-y-4 text-sm">
        <Input label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
        <Input label="New Password" value={newPassword} onChange={setNewPassword} />
        <Input label="Confirm Password" value={confirmNewPassword} onChange={setConfirmNewPassword} />
      </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        className="mt-6 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700"
        onClick={handleChangePassword}
        disabled={loading}
      >
         {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}

/* =========================
   HELPERS
   ========================= */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <label className="block mb-1 text-gray-600">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
            error ? "border-red-500" : ""
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

