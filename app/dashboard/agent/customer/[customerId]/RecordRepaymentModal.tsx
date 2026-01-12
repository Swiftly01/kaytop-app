// "use client";

// import React, { useState } from "react";

// interface RecordRepaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function RecordRepaymentModal({
//   isOpen,
//   onClose,
// }: RecordRepaymentModalProps) {
//   const [activeTab, setActiveTab] = useState<"cash" | "savings">("cash");
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [amount, setAmount] = useState("40,000");
//   const [date, setDate] = useState("15/01/2025");

//   if (!isOpen) return null;

//   const handleSubmit = () => {
//     setShowSuccess(true);
//   };

//   const handleSuccessClose = () => {
//     setShowSuccess(false);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       {!showSuccess ? (
//         <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//           {/* Header */}
//           <div className="flex items-center justify-between p-6 border-b">
//             <h2 className="text-lg font-semibold">Record repayment</h2>
//             <button
//               onClick={onClose}
//               className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
//             >
//               ×
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="flex border-b">
//             <button
//               onClick={() => setActiveTab("cash")}
//               className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
//                 activeTab === "cash"
//                   ? "text-violet-600 border-b-2 border-violet-600"
//                   : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Pay with cash
//             </button>
//             <button
//               onClick={() => setActiveTab("savings")}
//               className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
//                 activeTab === "savings"
//                   ? "text-violet-600 border-b-2 border-violet-600"
//                   : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Repay from savings
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-6">
//             {activeTab === "cash" ? (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Amount
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
//                       ₦
//                     </span>
//                     <input
//                       type="text"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                       className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Date
//                   </label>
//                   <input
//                     type="text"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     placeholder="DD/MM/YYYY"
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Amount
//                   </label>
//                   <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
//                     <div className="text-slate-900 font-medium">₦40,000</div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Available balance
//                   </label>
//                   <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
//                     <div className="text-slate-900 font-medium">₦6,421.10</div>
//                   </div>
//                 </div>

//                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                   <div className="flex gap-2">
//                     <svg
//                       className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <div className="text-sm text-orange-800">
//                       Insufficient balance in savings account
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="flex gap-3 p-6 border-t">
//             <button
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={activeTab === "savings"}
//               className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
//                 activeTab === "savings"
//                   ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                   : "bg-violet-600 text-white hover:bg-violet-700"
//               }`}
//             >
//               Record repayment
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
//           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-8 h-8 text-emerald-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <h3 className="text-xl font-semibold mb-2">Record successful</h3>
//           <p className="text-slate-600 mb-6">
//             Repayment has been recorded successfully
//           </p>
//           <button
//             onClick={handleSuccessClose}
//             className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
//           >
//             Done
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import Button from "@/app/_components/ui/Button";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
// }

// type PaymentMethod = "cash" | "savings";
// type Step = "select-method" | "enter-amount" | "confirm" | "success";

// export default function RecordRepaymentModal({ isOpen, onClose }: Props) {
//   const [step, setStep] = useState<Step>("select-method");
//   const [method, setMethod] = useState<PaymentMethod>("cash");
//   const [amount, setAmount] = useState("");

//   if (!isOpen) return null;

//   function resetAndClose() {
//     setStep("select-method");
//     setAmount("");
//     onClose();
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold">
//             {step === "select-method" && "Record Repayment"}
//             {step === "enter-amount" && "Enter Amount"}
//             {step === "confirm" && "Confirm Repayment"}
//             {step === "success" && ""}
//           </h2>
//           <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600">
//             ✕
//           </button>
//         </div>

//         {/* STEP: SELECT METHOD */}
//         {step === "select-method" && (
//           <div className="space-y-4">
//             <div
//               onClick={() => {
//                 setMethod("cash");
//                 setStep("enter-amount");
//               }}
//               className="cursor-pointer rounded-lg border p-4 hover:border-violet-500"
//             >
//               <h4 className="font-medium">Pay with Cash</h4>
//               <p className="text-sm text-slate-500">
//                 Record a cash repayment made by the customer
//               </p>
//             </div>

//             <div
//               onClick={() => {
//                 setMethod("savings");
//                 setStep("enter-amount");
//               }}
//               className="cursor-pointer rounded-lg border p-4 hover:border-violet-500"
//             >
//               <h4 className="font-medium">Pay from Savings</h4>
//               <p className="text-sm text-slate-500">
//                 Deduct repayment from customer savings balance
//               </p>
//             </div>
//           </div>
//         )}

//         {/* STEP: ENTER AMOUNT */}
//         {step === "enter-amount" && (
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm text-slate-500">Amount</label>
//               <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="₦0.00"
//                 className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
//               />
//             </div>

//             <Button
//               onClick={() => setStep("confirm")}
//               className="w-full bg-violet-600 text-white"
//               disabled={!amount}
//             >
//               Continue
//             </Button>
//           </div>
//         )}

//         {/* STEP: CONFIRM */}
//         {step === "confirm" && (
//           <div className="space-y-4">
//             <div className="rounded-lg bg-slate-50 p-4 text-sm">
//               <div className="flex justify-between mb-2">
//                 <span className="text-slate-500">Payment Method</span>
//                 <span className="font-medium capitalize">{method}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Amount</span>
//                 <span className="font-medium">₦{amount}</span>
//               </div>
//             </div>

//             <Button
//               onClick={() => setStep("success")}
//               className="w-full bg-violet-600 text-white"
//             >
//               Confirm Payment
//             </Button>

//             <Button
//               onClick={() => setStep("enter-amount")}
//               className="w-full bg-white border"
//             >
//               Back
//             </Button>
//           </div>
//         )}

//         {/* STEP: SUCCESS */}
//         {step === "success" && (
//           <div className="text-center space-y-4">
//             <div className="mx-auto w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
//               ✓
//             </div>

//             <h3 className="text-lg font-semibold">
//               {method === "cash" ? "Record Successful" : "Request Sent"}
//             </h3>

//             <p className="text-sm text-slate-500">
//               {method === "cash"
//                 ? "The repayment has been recorded successfully."
//                 : "Your savings repayment request has been sent for processing."}
//             </p>

//             <Button
//               onClick={resetAndClose}
//               className="w-full bg-violet-600 text-white"
//             >
//               Done
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/app/_components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Method = "cash" | "savings";
type Step =
  | "method"
  | "amount"
  | "summary"
  | "success"
  | "request-success";

const NEXT_PAYMENT = 15350;
const FULL_PAYMENT = 66950;

export default function RecordRepaymentModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("cash");
  const [amount, setAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(2);
  const showHeader = step !== "success" && step !== "request-success";


  /** Redirect countdown */
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
    setStep("method");
    setAmount(null);
    setMethod("cash");
    setCountdown(2);
    onClose();
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
         
         {/* CLOSE BUTTON – always positioned, independent */}
            <button
            onClick={handleClose}
            className="absolute right-4 top-1 z-10 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close modal"
            >
            ✕
            </button>


          {/* HEADER */}
{showHeader && (
  <div className="relative border-b px-6 py-4 mt-2">
    {/* HEADER CONTENT */}
    <div className={step === "summary" ? "text-center" : ""}>
      <h2 className="text-base font-semibold">
        {step === "summary" && "Transaction detail"}
        {(step === "method" || step === "amount") && "Record loan repayment"}
      </h2>

      {(step === "method" || step === "amount") && (
        <p className="mt-1 text-xs text-slate-500">
          How much are you repaying now?
        </p>
      )}

      {step === "summary" && (
        <p className="mt-1 text-xs text-slate-500">
          You are about to make a loan repayment of{" "}
          <span className="font-medium text-slate-700">
            ₦{amount?.toLocaleString()}
          </span>
        </p>
      )}
    </div>
  </div>
)}


          {/* BODY */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1 – METHOD */}
              {/* {step === "method" && (
                <motion.div key="method" {...anim}>
                  <div className="space-y-3">
                    {["cash", "savings"].map((m) => (
                      <div
                        key={m}
                        onClick={() => {
                          setMethod(m as Method);
                          setStep("amount");
                        }}
                        className="cursor-pointer rounded-lg border p-4 hover:border-violet-500"
                      >
                        <p className="font-medium capitalize">
                          Pay with {m}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )} */}
              {step === "method" && (
  <motion.div key="method" {...anim}>
    <div className="flex gap-4">
      {/* PAY WITH CASH */}
      <div
        onClick={() => {
          setMethod("cash");
          setStep("amount");
        }}
        className="flex-1 cursor-pointer rounded-xl border p-4 hover:border-violet-500 hover:bg-violet-50 transition"
      >
        <p className="text-sm font-medium">Pay with cash</p>
        <p className="mt-2 text-lg font-semibold">₦15,000</p>
      </div>

      {/* PAY WITH SAVINGS */}
      <div
        onClick={() => {
          setMethod("savings");
          setStep("amount");
        }}
        className="flex-1 cursor-pointer rounded-xl border p-4 hover:border-violet-500 hover:bg-violet-50 transition"
      >
        <p className="text-sm font-medium">Pay with savings</p>
        <p className="mt-2 text-lg font-semibold">₦15,000</p>
      </div>
    </div>
  </motion.div>
)}


              {/* STEP 2 – AMOUNT */}
              {step === "amount" && (
                <motion.div key="amount" {...anim}>
                  {method === "savings" && (
                    <div className="mb-4 rounded-lg bg-violet-50 p-4">
                      <p className="text-xs text-slate-500">Wallet balance</p>
                      <p className="text-lg font-semibold">₦42,100</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <AmountCard
                      label="Next repayment"
                      value={NEXT_PAYMENT}
                      selected={amount === NEXT_PAYMENT}
                      onClick={() => setAmount(NEXT_PAYMENT)}
                    />
                    <AmountCard
                      label="Full repayment"
                      value={FULL_PAYMENT}
                      selected={amount === FULL_PAYMENT}
                      onClick={() => setAmount(FULL_PAYMENT)}
                    />
                  </div>

                  <input
                    type="number"
                    placeholder="Enter a specific amount"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />

                  <p className="mt-1 text-right text-xs text-violet-600">
                    Min. 30,000 – Max. 70,000
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Button className="w-full bg-white border" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      className="w-full bg-violet-600 text-white"
                      disabled={!amount}
                      onClick={() =>
                        method === "cash"
                          ? setStep("summary")
                          : setStep("request-success")
                      }
                    >
                      {method === "cash" ? "Record Repayment" : "Make Request"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 – SUMMARY (CASH ONLY) */}
              {step === "summary" && (
                <motion.div key="summary" {...anim}>
                  <DetailRow label="Amount" value={`₦${amount}`} />
                  <DetailRow label="Service fee" value="₦0.00" />
                  <DetailRow label="Late repayment fee" value="₦0.00" border />
                  <DetailRow label="Total" value={`₦${amount}`} bold border />

                  <Button
                    className="mt-6 w-full bg-violet-600 text-white"
                    onClick={() => setStep("success")}
                  >
                    Record Repayment
                  </Button>
                </motion.div>
              )}

              {/* SUCCESS – CASH */}
              {step === "success" && (
                <motion.div key="success" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
                  <SuccessIcon />
                  <h3 className="mt-4 font-semibold">Record successful</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your loan has been repaid. Keep up the good work to get access
                    to better options.
                  </p>
                  <p className="mt-4 text-xs text-slate-400">
                    Redirecting in 0:0{countdown}
                  </p>
                </motion.div>
              )}

              {/* SUCCESS – SAVINGS */}
              {step === "request-success" && (
                <motion.div key="request" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
                  <SuccessIcon />
                  <h3 className="mt-4 font-semibold">Request Sent</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your loan has been repaid. Keep up the good work to get access
                    to better options.
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

/* ---------- Helpers ---------- */

const anim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

function AmountCard({ label, value, selected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 text-sm ${
        selected ? "border-violet-600 bg-violet-50" : ""
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">₦{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  border,
}: {
  label: string;
  value: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-3 text-sm ${
        border ? "border-b" : ""
      }`}
    >
      <span className="text-slate-500">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}


function SuccessIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-xl text-violet-600">
      ✓
    </div>
  );
}
