"use client";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="text-[#021C3E]">
          <h1 className="text-2xl font-bold leading-[1.33]">Settings</h1>
          <p className="text-base font-medium leading-4 opacity-50">System configuration and preferences</p>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-2">
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <h3 className="mb-4 text-lg font-semibold text-[#021C3E]">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="System Administrator"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@kaytop.com"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+234 800 000 0000"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-all duration-200">
                Save Changes
              </button>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <h3 className="mb-4 text-lg font-semibold text-[#021C3E]">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
              </div>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-all duration-200">
                Update Password
              </button>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <h3 className="mb-4 text-lg font-semibold text-[#021C3E]">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#344054]">Email Notifications</p>
                  <p className="text-xs text-[#475467]">Receive email updates</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#D0D5DD]" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#344054]">SMS Notifications</p>
                  <p className="text-xs text-[#475467]">Receive SMS alerts</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#D0D5DD]" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#344054]">Push Notifications</p>
                  <p className="text-xs text-[#475467]">Receive push notifications</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-[#D0D5DD]" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <h3 className="mb-4 text-lg font-semibold text-[#021C3E]">System Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Language</label>
                <select className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]">
                  <option>English</option>
                  <option>Yoruba</option>
                  <option>Hausa</option>
                  <option>Igbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Timezone</label>
                <select className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]">
                  <option>WAT (West Africa Time)</option>
                  <option>GMT</option>
                  <option>UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-2">Date Format</label>
                <select className="w-full px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
