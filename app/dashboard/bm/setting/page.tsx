import ChangePasswordForm from "@/app/_components/ui/auth/ChangePasswordForm";
import SettingsForm from "@/app/_components/ui/SettingsForm";
import { profileService } from "@/app/services/profileService";
import { Switch } from "@/components/ui/switch";
import { AxiosError } from "axios";
import { JSX } from "react";

export const metadata = {
  title: "Settings"
}

export default async function page(): Promise<JSX.Element> {
  let profile = undefined;

  try {
    profile = await profileService.getProfile();
  } catch (err: AxiosError | unknown) {
    const error = err as AxiosError;
    console.error("Failed to fetch profile:", error.message);
  }

  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Account Information"
            defaultChecked
          />
          <div className="tab-content">
            <div className="max-w-lg px-10 py-5 bg-white rounded-md">
              <h1 className="pb-5 text-lg font-semibold text-neutral-700">
                Account Information
              </h1>

              <SettingsForm data={profile} />
            </div>
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Security & Login"
          />
          <div className="tab-content">
            <div className="grid items-start grid-cols-1 md:grid-cols-2 xl:grid-cols-[450px_470px] gap-5">
              <div className="py-6 bg-white rounded-md px-7">
                <h1 className="text-lg font-semibold pb-7 text-neutral-700">
                  Security
                </h1>

                <p className="text-sm font-semibold text-neutral-700">
                  Change password
                </p>

                <div className="flex justify-between">
                  <p className="text-sm text-gray-400">
                    Is your password compromised, change it here
                  </p>
                  <img src="/right.svg" alt="right arrow" />
                </div>

                <div className="mt-2 border-b border-gray-200"></div>
                {/* Two Factor Authentication - Disabled temporarily as backend is not ready */}
                {/* 
                <div className="my-10">
                  <h1 className="text-sm font-semibold text-neutral-700">
                    Two Factor Authentication
                  </h1>
                  <div className="flex items-center justify-between my-2">
                    <div className="flex items-center gap-2">
                      <img src="/phone.svg" alt="google-icon" />
                      <p>SMS Authentication</p>
                    </div>
                    <Switch  disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 ml-1">
                      <img src="/google.svg" alt="google-icon" />
                      <p>Email Authentication</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
                */}
              </div>

              <div className="py-6 bg-white rounded-md px-7">
                <div className="flex items-center">
                  <img src="/left.svg" alt="back icon" />
                  <p className="text-sm text-gray-400">Back</p>
                </div>
                <div className="pl-2 my-5">
                  <p className="text-lg font-semibold text-neutral-700">
                    Password Information
                  </p>
                  <p className="text-sm text-gray-400">
                    Change your password below
                  </p>

                  <div className="my-5 border-b border-gray-200">
                    <ChangePasswordForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
