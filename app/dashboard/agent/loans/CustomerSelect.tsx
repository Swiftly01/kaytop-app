"use client";

import { CustomerService } from "@/app/services/customerService";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    CustomerService.getCustomersByBranch({ page: 1, limit: 50 })
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCustomers = customers.filter((c) =>
    `${c.firstName} ${c.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Select customer"
        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-auto">
          {loading && (
            <div className="px-4 py-2 text-sm text-slate-500">
              Loading customers...
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="px-4 py-2 text-sm text-slate-500">
              No customers found
            </div>
          )}

          {!loading &&
            filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  setQuery(`${c.firstName} ${c.lastName}`);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-violet-50 focus:bg-violet-50"
              >
                {c.firstName} {c.lastName}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}


