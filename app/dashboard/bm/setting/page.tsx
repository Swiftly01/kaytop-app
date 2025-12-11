import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";
import { MetricProps } from "@/app/types/dashboard";
import { Switch } from "@/components/ui/switch";
import { loans as dashboardData } from "@/lib/utils";
import Link from "next/link";
import { JSX } from "react";

const metricData: MetricProps[] = dashboardData;

export default function page(): JSX.Element {
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

              <img src="/profile-picture.svg" alt="profile picture" />

              <form action="">
                <input type="file" name="" id="" className="py-4" />
                <div>
                  <label
                    className="font-semibold text-neutral-700"
                    htmlFor="name"
                  >
                    Name
                  </label>

                  <Input type="text" placeholder="Jackson Wallace" id="name" />
                </div>

                <div>
                  <label
                    className="font-semibold text-neutral-700"
                    htmlFor="email"
                  >
                    Phone Number
                  </label>

                  <Input type="text" placeholder="070 0000 0000" id="phone" />
                </div>

                <div>
                  <label
                    className="font-semibold text-neutral-700"
                    htmlFor="email"
                  >
                    Email
                  </label>

                  <Input
                    type="text"
                    placeholder="hello@jackson5.com"
                    id="phone"
                  />
                </div>
                <div className="my-5">
                  <Button fullWidth={true} variant="tertiary">
                    Update
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Security & Login"
          />
          <div className="tab-content">
            <div  className="grid items-start grid-cols-1 md:grid-cols-2 xl:grid-cols-[450px_470px] gap-5">
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
                <div className="my-10">
                  <h1 className="text-sm font-semibold text-neutral-700">
                    Two Factor Authentication
                  </h1>
                  <div className="flex items-center justify-between my-2">
                    <div className="flex items-center gap-2">
                      <img src="/phone.svg" alt="google-icon" />
                      <p>SMS Authentication</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 ml-1">
                      <img src="/google.svg" alt="google-icon" />
                      <p>Email Authentication</p>
                    </div>
                    <Switch />
                  </div>
                </div>
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

                  <div className="my-5 border-b border-gray-200"></div>

                  <form action="">
                    <div>
                      <label
                        className="font-semibold text-gray-400"
                        htmlFor="name"
                      >
                        Current password
                      </label>

                      <Input
                        type="password"
                        placeholder="*********"
                        id="name"
                      />
                    </div>

                    <div>
                      <label
                        className="font-semibold text-gray-400"
                        htmlFor="name"
                      >
                        New password
                      </label>
                      <Input
                        type="password"
                        placeholder="*********"
                        id="name"
                      />{" "}
                    </div>

                    <div>
                      <label
                        className="font-semibold text-gray-400"
                        htmlFor="name"
                      >
                        Confirm New password
                      </label>
                      <Input
                        type="password"
                        placeholder="*********"
                        id="name"
                      />{" "}
                    </div>
                    <div className="my-5">
                      <Button fullWidth={true} variant="tertiary">
                        Change Password
                      </Button>
                      <Link
                        className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
                        href="/"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
