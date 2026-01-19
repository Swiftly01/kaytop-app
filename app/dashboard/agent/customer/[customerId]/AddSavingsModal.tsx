import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import Button from "@/app/_components/ui/Button";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  currentBalance: number;
  onSave: (amount: number, description: string) => Promise<void>;
}

type Step = "amount" | "success" | "error";

export default function AddSavingsModal({
  isOpen,
  onClose,
  customerId,
  currentBalance,
  onSave,
}: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newBalance, setNewBalance] = useState(currentBalance);

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
    setStep("amount");
    setAmount(null);
    setCountdown(3);
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }

  useEffect(() => {
  setNewBalance(currentBalance);
}, [currentBalance]);


  async function handleSave() {
    if (!amount || amount <= 0) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      await onSave(amount, "Savings deposit");
      setNewBalance(currentBalance + amount);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save money. Please try again.");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const isValidAmount = amount && amount >= 1000 && amount <= 100000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg relative p-6 animate-in fade-in slide-in-from-bottom-3">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {step === "amount" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Add Money to Savings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              How much are you saving now?
            </p>
          </div>
        )}

        {/* STEP 1 – AMOUNT INPUT */}
        {step === "amount" && (
          <div className="space-y-4">
            {/* Amount Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium text-foreground mb-1.5 sm:w-40">
                Enter specific amount:
              </label>
              <input
                type="number"
                placeholder="₦0.00"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1  rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition"

              />
              </div>
              <p className="text-xs text-muted-foreground  ml-0 sm:ml-40">
                Minimum ₦1,000 – Maximum ₦100,000
              </p>
            

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValidAmount || isLoading}
                className="flex-1 bg-violet-600 text-white"
              >
                {isLoading ? (
                  <>
                   <div className="flex items-center gap-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                    </div>
                  </>
                ) : (
                  "Save Money"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#f4ebff] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Saved Successfully</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your savings have been updated. Keep up the good work to access better options.
            </p>

            {/* Updated Balance Card */}
            <div className="mt-6 bg-[#f4ebff] rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                ₦{newBalance.toLocaleString()}
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Redirecting in 0:0{countdown}
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {step === "error" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Transaction Failed</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button onClick={() => setStep("amount")} className="flex-1 bg-violet-600 text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
