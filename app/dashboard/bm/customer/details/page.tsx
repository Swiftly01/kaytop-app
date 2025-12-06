import BreadCrumb from "@/app/_components/ui/BreadCrumb";
import DrawerTable from "@/app/_components/ui/DrawerTable";
import PieChart from "@/app/_components/ui/PieChart";
import RepaymentProgress from "@/app/_components/ui/RepaymentProgress";
import Table from "@/app/_components/ui/Table";
import { ROUTES } from "@/lib/utils";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <BreadCrumb title="Customer Details" link={ROUTES.Bm.CUSTOMERS} />
        <div className="flex flex-wrap gap-6 my-5 lg:flex-nowrap">
          <div className="flex flex-col items-center w-full gap-4 px-5 bg-white rounded-lg sm:flex-row">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <PieChart />
            </div>

            <div className="text-center sm:text-left">
              <h1 className=" text-neutral-700 text-md">Loan Repayment</h1>
              <div className="py-5">
                <p className="text-sm text-gray-600">
                  Next Payment - Jan 15, 2025
                </p>
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold">₦40,206.20</h1>
                  <span className="px-2 text-sm bg-green-200 rounded-full text-end">
                    3.4%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center w-full gap-4 px-5 bg-white rounded-lg sm:flex-row">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <PieChart />
            </div>

            <div className="text-center sm:text-left">
              <h1 className=" text-neutral-700 text-md">Loan Repayment</h1>
              <div className="py-5">
                <p className="text-sm text-gray-600">
                  Next Payment - Jan 15, 2025
                </p>
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold">₦40,206.20</h1>
                  <span className="px-2 text-sm bg-green-200 rounded-full text-end">
                    3.4%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 px-5 py-8 bg-white">
          <div>
            <p className="text-sm text-gray-500">Customer Name</p>
            <h1 className="text-sm text-neutral-700">Mike Salam</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <h1 className="text-sm text-neutral-700">46729233</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date Joined</p>
            <h1 className="text-sm text-neutral-700">Jan 15, 2025</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email address</p>
            <h1 className="text-sm text-neutral-700">mikesalam234@email.com</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone number</p>
            <h1 className="text-sm text-neutral-700">+234 812738917</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <h1 className="text-sm text-neutral-700">Male</h1>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <h1 className="text-sm text-neutral-700">
              15 Lagos Street, Victoria Island, Lagos
            </h1>
          </div>
        </div>
        <div className="p-5 my-5 bg-white ">
          <h1 className="font-semibold text-neutral-700">Active Loan</h1>
          <div className="flex flex-wrap justify-between gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-500">Loan ID:</p>
              <h1 className="text-sm text-neutral-700">46729233</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <h1 className="text-sm text-neutral-700">₦50,000</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <h1 className="text-sm text-neutral-700">₦35,000</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Payment</p>
              <h1 className="text-sm text-neutral-700">₦35,000</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Rate</p>
              <h1 className="text-sm text-neutral-700">20%</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <h1 className="text-sm text-neutral-700">23rd Nov, 2025</h1>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <h1 className="text-sm text-neutral-700">23rd Nov, 2025</h1>
            </div>
          </div>
          <RepaymentProgress paid={35000} total={60000} />

          <div className="drawer drawer-end">
            <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label
                htmlFor="my-drawer-5"
                className="underline cursor-pointer drawer-button text-md decoration-brand-purple text-brand-purple"
              >
                View Payment Schedule
              </label>
            </div>
            <div className="z-40 drawer-side">
              <label
                htmlFor="my-drawer-5"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="z-50 min-h-full p-4 overflow-scroll bg-white menu w-80 md:w-140">
                <h1 className="text-center text-md text-neutral-700">Payment Schedule</h1>
                <DrawerTable />
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p className="pb-5 text-md">Transaction History</p>
          <div className="p-10 bg-white">
            <Table />
          </div>
        </div>
      </div>
    </div>
  );
}
