"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import LoanSetupStep from "./LoanSetupStep";

export interface LoanDraft {
  customerId: number;
  amount: number;
  durationDays: number;
}

export default function CreateLoanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeAndReset = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-xl bg-white rounded-2xl p-6">
          <LoanSetupStep
            onCancel={closeAndReset}
            onSuccess={() => {
              toast.success("You have just created and disbursed a new loan");
              closeAndReset();
            }}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
