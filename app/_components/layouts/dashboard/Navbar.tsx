import { AuthProvider } from "@/app/context/AuthContext";
import { SettingsService } from "@/app/services/settingsService";
import logo from "@/public/logo.png";
import Image from "next/image";
import { JSX } from "react";
import ProfileDropdown from "../../ui/ProfileDropdown";

export default async function Navbar(): Promise<JSX.Element> {
  // page.tsx
  //let profile = null;

  // try {
  //   profile = await SettingsService.getProfile();
  // } catch (err: any) {
  //   console.error("Failed to fetch profile:", err.message);
  // }

  return (
    <nav className="fixed top-0 left-0 z-40 flex items-center w-full h-16 px-4 bg-white shadow">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <label
            htmlFor="my-drawer-4"
            className="btn btn-square btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="size-5"
            >
              <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
              <path d="M9 4v16"></path>
              <path d="M14 10l2 2l-2 2"></path>
            </svg>
          </label>

          <div className="flex items-center">
            <Image height="40" src={logo} alt="Kaytop logo" />
            <span className="text-sm font-semibold sm:text-base md:text-lg">
              Kaytop MI
            </span>
          </div>
        </div>

        <AuthProvider>
          <ProfileDropdown />
        </AuthProvider>
      </div>
    </nav>
  );
}
