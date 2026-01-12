"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/app/_components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "amount" | "success";

export default function AddSavingsModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [walletBalance, setWalletBalance] = useState(42100); // initial wallet balance

  // Countdown for auto-close
  useEffect(() => {
    if (step === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c === 1) {
            handleClose();
            return 2;
          }
          return c - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  function handleClose() {
    setStep("amount");
    setAmount(null);
    setCountdown(2);
    onClose();
  }

  function handleSave() {
    if (!amount) return;
    setWalletBalance(walletBalance + amount); // update balance
    setStep("success");
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-xl bg-white shadow-lg relative"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-1 z-10 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Header */}
          <div className="px-6 py-4">
            <h2 className="text-base font-semibold">Add money to your savings</h2>
            {step === "amount" && (
              <p className="mt-1 text-xs text-slate-500"> How much are you saving now?</p>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <AnimatePresence mode="wait">
              {/* STEP 1 – Amount */}
              {step === "amount" && (
            <motion.div
                key="amount"
                {...anim}
                className="flex flex-col gap-4"
            >
                {/* Label + Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Label */}
                <label className="text-sm font-medium text-slate-700 sm:w-40">
                    Enter specific amount
                </label>

                {/* Input */}
                <input
                    type="number"
                    placeholder="₦0.00"
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                </div>

                {/* Hint */}
                <p className="text-xs text-slate-400 ml-0 sm:ml-40">
                Minimum ₦1,000 – Maximum ₦100,000
                </p>

                {/* Buttons */}
                <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <Button
                    className="w-full sm:w-1/2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    className="w-full sm:w-1/2 bg-violet-600 text-white hover:bg-violet-700"
                    disabled={!amount || amount < 1000 || amount > 100000}
                    onClick={handleSave}
                >
                    Save Money
                </Button>
                </div>
            </motion.div>
            )}


              {/* STEP 2 – Success */}
              {step === "success" && (
                <motion.div
                  key="success"
                  {...anim}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <SuccessIcon />
                  <h3 className="mt-4 font-semibold">Saved Successfully</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your savings have been updated. Keep up the good work to access better options.
                  </p>

                  {/* Wallet Balance Card */}
                    <p className="text-sm text-slate-500 mt-2">Wallet Balance</p>
                  <div className=" px-4 rounded-lg bg-gray-200 py-2 text-center">
                    <p className="text-lg font-semibold">₦{walletBalance.toLocaleString()}</p>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Redirecting in 0:0{countdown}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* Helpers */
const anim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

function SuccessIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-xl text-violet-600">
      ✓
    </div>
  );
}
