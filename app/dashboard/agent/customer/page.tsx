"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  status: "Active" | "Scheduled";
  phone: string;
  email: string;
  dateJoined: string;
}

const customers: Customer[] = [
  {
    id: "43756",
    name: "Ademola Jumoke",
    status: "Active",
    phone: "+2348160006000",
    email: "elford@mac.com",
    dateJoined: "June 03, 2024",
  },
  {
    id: "43178",
    name: "Adegboyega Precious",
    status: "Active",
    phone: "+2348123456789",
    email: "bradl@comcast.net",
    dateJoined: "Dec 24, 2023",
  },
  {
    id: "70668",
    name: "Nneka Chukwu",
    status: "Scheduled",
    phone: "+2349044449999",
    email: "fwitness@yahoo.ca",
    dateJoined: "Nov 11, 2024",
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const goToCustomer = (id: string) => {
    router.push(`/dashboard/agent/customer/${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded-lg text-sm">Select dates</button>
          <button className="px-3 py-2 border rounded-lg text-sm">Filters</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Customers" value="2,000" />
        <StatCard title="Active Loans" value="2,000" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Phone Number</th>
              <th className="p-4">Email</th>
              <th className="p-4">Date Joined</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50"
              >
                <td onClick={() => goToCustomer(c.id)} className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                </td>
                <td
                  className="p-4 font-medium cursor-pointer"
                  onClick={() => goToCustomer(c.id)}
                >
                  {c.name}
                  <div className="text-xs text-gray-400">ID: {c.id}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.dateJoined}</td>
                <td className="p-4 flex gap-3">
                  <button className="text-gray-500 hover:text-gray-700">
                    <Trash2 size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-xl p-5 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-xs text-green-600 mt-1">↑ 100% vs last month</p>
        </div>
        <MoreVertical className="text-gray-400" size={18} />
      </div>
    </div>
  );
}
