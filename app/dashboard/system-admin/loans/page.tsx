import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700">
          <h1 className="text-2xl font-medium">Loans</h1>
          <p className="mt-2 text-md opacity-50">Manage all loans</p>
        </div>
        <div className="mt-10">
          <p className="text-neutral-500">Loan management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
