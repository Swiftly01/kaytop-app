"use client";

import { X } from "lucide-react";
import { useCustomerFlow } from "./AddCustomerFlowProvider";

export default function FlowModal({ children }: { children: React.ReactNode }) {
  const { open, close } = useCustomerFlow();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 px-4">
      <div className="bg-white w-full h-11/12 max-w-xl rounded-xl shadow-lg relative p-6 animate-in fade-in slide-in-from-bottom-3 overflow-y-auto">
        
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-slate-600 hover:text-slate-900 cursor-pointer"
          onClick={close}
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>
  );
}
