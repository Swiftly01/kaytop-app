import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Button from "@/app/_components/ui/Button";

interface CustomerData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address?: string;
  state?: string;
  branch?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
  onSave: (customerId: number, data: { firstName: string; lastName: string }) => Promise<void>;
}

type Step = "form" | "success" | "error";

export default function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: Props) {
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [firstName, setFirstName] = useState(customer?.firstName || "");
  const [lastName, setLastName] = useState(customer?.lastName || "");

  // Reset form when customer changes
  useEffect(() => {
  if (customer) {
    setFirstName(customer.firstName);
    setLastName(customer.lastName);
  }
}, [customer]);

  function handleClose() {
    setStep("form");
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }

  async function handleSave() {
    if (!customer || !firstName.trim() || !lastName.trim()) return;
    
    setIsLoading(true);
    setErrorMessage("");

    try {
      await onSave(customer.id, { firstName: firstName.trim(), lastName: lastName.trim() });
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update customer");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  const isValid = firstName.trim() && lastName.trim();

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

        {/* FORM STATE */}
        {step === "form" && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Edit Customer</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update customer details below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  First Name *
                </label>
                <Input
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Last Name *
                </label>
                <Input
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* Read-only fields */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Email (Read-only)
                </label>
                <Input value={customer.email} disabled className="bg-muted" />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Phone (Read-only)
                </label>
                <Input value={customer.mobileNumber} disabled className="bg-muted" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isValid || isLoading}
                  className="flex-1 items-center bg-violet-600 text-white"
                >
                  {isLoading ? (
                    <>
                    <div className="flex items-center gap-3 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                      </div>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Customer Updated!
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Customer details have been updated successfully.
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
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Update Failed
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button onClick={() => setStep("form")} className="flex-1 items-center bg-violet-600 text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
