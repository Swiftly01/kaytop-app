import { useState } from "react";
import { X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "@/app/_components/ui/Button";

interface CustomerData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
  onDelete: (customerId: number) => Promise<void>;
}

type Step = "confirm" | "success" | "error";

export default function DeleteCustomerModal({
  isOpen,
  onClose,
  customer,
  onDelete,
}: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleClose() {
    setStep("confirm");
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }

  async function handleDelete() {
    if (!customer) return;
    
    setIsLoading(true);
    setErrorMessage("");

    try {
      await onDelete(customer.id);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to delete customer");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg relative p-6 animate-in fade-in slide-in-from-bottom-3">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* CONFIRM STATE */}
        {step === "confirm" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Delete Customer?
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {customer.firstName} {customer.lastName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="bg-muted/50 rounded-lg p-3 mt-4 text-left">
              <p className="text-xs text-muted-foreground">Customer Details:</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                  <div className="flex items-center gap-3 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                    </div>
                  </>
                ) : (
                  "Delete Customer"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Customer Deleted
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              The customer has been deleted successfully.
            </p>
            <Button onClick={handleClose} className="flex-1 mt-6 items-center bg-violet-600 text-white">
              Done
            </Button>
          </div>
        )}

        {/* ERROR STATE */}
        {step === "error" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Delete Failed
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button onClick={() => setStep("confirm")} className="flex-1 items-center bg-violet-600 text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
