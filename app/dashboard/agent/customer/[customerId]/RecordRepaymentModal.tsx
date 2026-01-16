import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, XCircle, Wallet, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/app/_components/ui/Button";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  loanId: number;
  customerId: number;
  nextPayment: number;
  fullPayment: number;
  savingsBalance: number;
  onRecordCash: (amount: number, proof?: File) => Promise<void>;
  onUseSavings: (amount: number) => Promise<void>;
}

type Method = "cash" | "savings";
type Step = "method" | "amount" | "summary" | "success" | "error" | "request-success";;

export default function RecordRepaymentModal({
  isOpen,
  onClose,
  loanId,
  customerId,
  nextPayment,
  fullPayment,
  savingsBalance,
  onRecordCash,
  onUseSavings,
}: Props) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("cash");
  const [amount, setAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [proof, setProof] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const showHeader = step !== "success" && step !== "request-success";


  const hasSavings = savingsBalance > 0;

  useEffect(() => {
    if (step === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c === 1) {
            handleClose();
            return 3;
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
    setCountdown(3);
    setProof(null);
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }

  function handleSelectMethod(m: Method) {
    if (m === "savings" && !hasSavings) return;
    setMethod(m);
    setStep("amount");
  }

  async function handleRecordRepayment() {
    if (!amount) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (method === "cash") {
        await onRecordCash(amount, proof || undefined);
      } else {
        await onUseSavings(amount);
      }
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to record repayment. Please try again.");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-xl bg-white shadow-lg relative p-4 px-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {step !== "success" && step !== "error" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {step === "summary" ? "Transaction Detail" : "Record Loan Repayment"}
            </h2>
            {step === "method" && (
              <p className="text-sm text-muted-foreground mt-1">
                How would you like to make this payment?
              </p>
            )}
            {step === "amount" && (
              <p className="text-sm text-muted-foreground mt-1">
                How much are you repaying now?
              </p>
            )}
            {step === "summary" && (
              <p className="text-sm text-muted-foreground mt-1">
                You are about to make a loan repayment of{" "}
                <span className="font-semibold text-primary">₦{amount?.toLocaleString()}</span>
              </p>
            )}
          </div>
        )}

            <AnimatePresence mode="wait">
        {/* STEP 1 – METHOD SELECTION */}
        {step === "method" && (
          <motion.div key="method" {...anim}>
          <div className="grid grid-cols-2 gap-4">
            {/* Pay with Cash */}
            <button
              onClick={() => handleSelectMethod("cash")}
              className="flex-1 text-left cursor-pointer rounded-xl border p-4 hover:border-violet-500 hover:bg-violet-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#f4ebff] flex items-center justify-center mb-3">
                <Banknote className="w-5 h-5 text-[#7f56d9]" />
              </div>
              <p className="text-sm font-medium text-foreground">Pay with cash</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                ₦{nextPayment?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Next payment</p>
            </button>

            {/* Pay with Savings */}
            <button
              onClick={() => handleSelectMethod("savings")}
              disabled={!hasSavings}
              className={`flex-1  items-start rounded-xl border p-4 transition-all text-left ${
                hasSavings
                  ? "border-border cursor-pointer hover:border-violet-500 hover:bg-violet-50"
                  : "border-border bg-muted/50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#f4ebff] flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-[#7f56d9]" />
              </div>
              <p className="text-sm font-medium text-foreground">Pay with savings</p>
              {hasSavings ? (
                <>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    ₦{savingsBalance?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">Available balance</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">No available savings</p>
              )}
            </button>
          </div>
          </motion.div>
        )}

        {/* STEP 2 – AMOUNT INPUT */}
        {step === "amount" && (
           <motion.div key="amount" {...anim}>
          <div className="space-y-4">
            {method === "savings" && (
              <div className="bg-violet-50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-slate-500">Wallet balance</span>
                <span className="text-lg font-semibold ">
                  ₦{savingsBalance?.toLocaleString()}
                </span>
              </div>
            )}

            {/* Amount Cards */}
            <div className="grid grid-cols-2 gap-3">
              <AmountCard
                label="Next Payment"
                value={nextPayment}
                selected={amount === nextPayment}
                onClick={() => setAmount(nextPayment)}
              />
              <AmountCard
                label="Full Payment"
                value={fullPayment}
                selected={amount === fullPayment}
                onClick={() => setAmount(fullPayment)}
              />
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Enter specific amount
              </label>
              <input
                type="number"
                placeholder="₦0.00"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Min. ₦1,000 – Max. ₦{fullPayment?.toLocaleString()}
              </p>
            </div>

            {/* Proof Upload (Cash only) */}
            {method === "cash" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Upload proof (optional)
                </label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProof(e.target.files?.[0] || null)}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setStep("method")}
                variant="secondary"
                className="w-full flex-1 bg-gray-300 border text-violet-500"
              >
                Cancel
              </Button>
              <Button
                onClick={() => (method === "cash" ? setStep("summary") : handleRecordRepayment())}
                disabled={!amount || amount <= 0 || (method === "savings" && amount > savingsBalance)}
               className="w-full flex-1 bg-violet-600 text-white"
              >
                {method === "cash" ? "Continue" : "Make Request"}
              </Button>
            </div>
          </div>
          </motion.div>
        )}

        {/* STEP 3 – SUMMARY (Cash only) */}
        {step === "summary" && (
                <motion.div key="summary" {...anim}>
            <DetailRow label="Payment Method" value="Cash" />
            <DetailRow label="Amount" value={`₦${amount?.toLocaleString()}`} />
            <DetailRow label="Loan ID" value={`#${loanId}`} />
            <DetailRow label="Date" value={new Date()?.toLocaleDateString()} border />
             {/* <DetailRow label="Service fee" value="₦0.00" />
                  <DetailRow label="Late repayment fee" value="₦0.00" border /> */}
            <DetailRow label="Total" value={`₦${amount?.toLocaleString()}`} bold />

            <Button
              onClick={handleRecordRepayment}
              disabled={isLoading}
               className="mt-6 w-full bg-violet-600 text-white"
            >
              {isLoading ? (
                <>
                <div className="flex items-center gap-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                  </div>
                </>
              ) : (
                "Record Repayment"
              )}
            </Button>
          
           </motion.div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
        <motion.div key="success" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#f4ebff] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {method === "cash" ? "Record Successful" : "Request Sent"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {method === "cash"
                ? "Your loan repayment has been recorded successfully."
                : "Your savings transfer request has been sent for approval."}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Redirecting in 0:0{countdown}
            </p>
          </div>
          </motion.div>
        )}

        {/* SUCCESS – SAVINGS */}
              {step === "request-success" && (
                <motion.div key="request" {...anim} className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f4ebff] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="mt-4 font-semibold">Request Sent</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your loan has been repaid. Keep up the good work to get access
                    to better options.
                  </p>
                </motion.div>
              )}

        {/* ERROR STATE */}
        {step === "error" && (
          <motion.div key="error" {...anim} className="flex-1 items-center justify-center py-8 text-center">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Transaction Failed</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary"  onClick={handleClose} className="flex-1 w-full bg-gray-300 border text-violet-500">
                Cancel
              </Button>
              <Button onClick={() => setStep("amount")} className="flex-1 w-full bg-violet-600 text-white">
                Try Again
              </Button>
            </div>
          </div>
          </motion.div>
        )}
      
      </AnimatePresence>
    </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Helper Components ---------- */
const anim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};


function AmountCard({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 text-sm ${
        selected ? "border-violet-600 bg-violet-50" : ""
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold"> ₦{value?.toLocaleString()}</p>
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
