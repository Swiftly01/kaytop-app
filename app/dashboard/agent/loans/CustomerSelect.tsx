// export function CustomerSelect({
//   onSelect,
// }: {
//   onSelect: (id: number) => void;
// }) {
//   // Fetch customers by branch
//   // Use your CustomerService.getCustomersByBranch

//   return (
//     <div className="relative">
//       <input
//         placeholder="e.g. Linear"
//         className="input"
//       />
//       {/* Dropdown list */}
//     </div>
//   );
// }


"use client";

import { CustomerService } from "@/app/services/customerService";
import { useEffect, useState } from "react";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
}

export default function CustomerSelect({
  onSelect,
}: {
  onSelect: (id: number) => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    CustomerService.getCustomersByBranch({ page: 1, limit: 20 }).then(res => {
      setCustomers(res.data);
    });
  }, []);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. Linear"
        className="w-full border rounded-lg px-4 py-2"
      />

      {query && (
        <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-auto">
          {customers
            .filter(c =>
              `${c.firstName} ${c.lastName}`
                .toLowerCase()
                .includes(query.toLowerCase())
            )
            .map(c => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  setQuery(`${c.firstName} ${c.lastName}`);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {c.firstName} {c.lastName}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
