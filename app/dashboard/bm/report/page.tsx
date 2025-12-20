import Button from "@/app/_components/ui/Button";
import DrawerTable from "@/app/_components/ui/DrawerTable";
import FilterButton from "@/app/_components/ui/FilterButton";
import Metric from "@/app/_components/ui/Metric";
import Table from "@/app/_components/ui/table/DisbursementTable";
import { MetricProps } from "@/app/types/dashboard";
import { reports as dashboardData } from "@/lib/utils";
import Link from "next/link";
import { JSX } from "react";

const metricData: MetricProps[] = dashboardData;

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700">
          <h1 className="text-2xl font-medium">Overview</h1>
          <p className="text-md">Igando Branch</p>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-10 gap-y-2">
          <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
            <FilterButton active={true}>12 months</FilterButton>
            <FilterButton>30 days</FilterButton>
            <FilterButton>7 days</FilterButton>
            <FilterButton>24 hours</FilterButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
              <img src="/calendar.svg" alt="calendar" />
              <span> Select dates</span>
            </FilterButton>
            <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
              <img src="/filter.svg" alt="calendar" />
              <span>Filter</span>
            </FilterButton>
          </div>
        </div>
        <Metric item={metricData} cols={2} />

        <div>
          <p className="pb-5 font-semibold text-md text-neutral-700">Reports</p>
          <div className="p-10 bg-white">
            <Table />
          </div>
        </div>

        <div className=" drawer drawer-end">
          <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label
              htmlFor="my-drawer-5"
              className="underline cursor-pointer drawer-button text-md decoration-brand-purple text-brand-purple"
            >
              View Loan
            </label>
          </div>
          <div className="z-40 drawer-side ">
            <label
              htmlFor="my-drawer-5"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="z-50 min-h-full p-4 overflow-scroll bg-white menu w-80 md:w-120">
              <h1 className="font-semibold text-center text-md text-neutral-700">
                Loan Details
              </h1>
              <div className="flex justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Report ID
                  </p>
                  <h1 className="text-sm text-neutral-700">BN-B1E73DA–0017</h1>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Credit Officer
                  </p>
                  <h1 className="text-sm text-neutral-700">James Alagbon</h1>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Branch
                  </p>
                  <h1 className="text-sm text-neutral-700">Alagbon</h1>
                </div>
              </div>
              <p className="px-5 font-semibold text-neutral-700">Details</p>
              <div className="flex justify-between px-5 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Loans Disbursed
                  </p>
                  <h1 className="text-sm font-semibold text-neutral-700">10</h1>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Loans Value Disbursed
                  </p>
                  <h1 className="text-sm font-semibold text-neutral-700">
                    ₦300,000
                  </h1>
                </div>
              </div>
              <div className="flex justify-between px-5 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Savings Collected
                  </p>
                  <h1 className="text-sm font-semibold text-neutral-700">
                    ₦300,000
                  </h1>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Repayments Collected
                  </p>
                  <h1 className="text-sm font-semibold text-neutral-700">23</h1>
                </div>
              </div>

              <div className="flex gap-6 px-5 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Date Sent
                  </p>
                  <h1 className="text-sm text-neutral-700">Dec 30, 2022</h1>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-500">
                    Time Sent
                  </p>
                  <h1 className="text-sm text-neutral-700">2:38 PM</h1>
                </div>
              </div>

              <div className="px-5 mt-6">
                <Button fullWidth={true} variant="tertiary">
                  Approve
                </Button>
                <Link
                  className="flex justify-center px-5 py-2 my-2 font-medium transition-all duration-300 rounded-md cursor-pointer text-brand-purple hover:bg-brand-purple hover:text-white"
                  href="/"
                >
                  Decline
                </Link>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
