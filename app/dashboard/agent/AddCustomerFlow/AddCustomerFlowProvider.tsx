"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useCreateCustomer } from "../queries/useCreateCustomer";
import { useUpdateGuarantorDetails } from "../queries/useUpdateGuarantorDetails";


export interface CustomerData {
  // Step 1 – Customer
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  state: string;
  branch: string;
  profilePicture?: File | null;

  // Step 2 – Guarantor
  guarantorName: string;
  guarantorRelationship: string;
  guarantorPhone: string;
  guarantorPicture?: File | null;
  guarantorAddress: string;
  guarantorState: string;
  guarantorBranch: string;
  guarantorEmail: string;

  // ID Verification
  idCardFile?: File | null;
  selfieFile?: File | null;
}

type IDVerificationStep = "upload" | "selfie";
type EntryMode = "camera" | "upload";

interface FlowContextType {
  open: boolean;
  step: number;
  data: CustomerData;
  customerId?: number;

  // ID Verification sub-steps
  idStep: IDVerificationStep;
  entryMode: EntryMode;
  capturedFile: File | null;
  capturedPreview: string | null;

  // Loading states (mock for now)
  isCreatingCustomer: boolean;
  isUpdatingGuarantor: boolean;

  start: () => void;
  close: () => void;

  nextStep: () => void;
  prevStep: () => void;

  updateField: (field: string, value: string | File | null) => void;

  submitStep1: () => void;
  submitStep2: () => void;
  submitFinal: () => void;

  captureIDFile: (file: File) => void;
  captureSelfieFile: (file: File) => void;

  // ID Verification navigation
  handleOpenCamera: () => void;
  handleFileUploadNext: () => void;
  handleIDBack: () => void;
  handleCapture: (file: File) => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

const initialData: CustomerData = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  profilePicture: null,
  state: "",
  branch: "",
  address: "",

  guarantorName: "",
  guarantorRelationship: "",
  guarantorPhone: "",
  guarantorPicture: null,
  guarantorEmail: "",
  guarantorAddress: "",
  guarantorState: "",
  guarantorBranch: "",

  idCardFile: null,
  selfieFile: null,
};

export function AddCustomerFlowProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [data, setData] = useState<CustomerData>(initialData);

  // ID Verification states
  const [idStep, setIdStep] = useState<IDVerificationStep>("upload");
  const [entryMode, setEntryMode] = useState<EntryMode>("upload");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Mock loading states
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isUpdatingGuarantor, setIsUpdatingGuarantor] = useState(false);

  const createCustomerMutation = useCreateCustomer();
  const guarantorMutation = useUpdateGuarantorDetails(customerId!);

  // Step 1 submit
  const submitStep1 = async () => {
  const formData = new FormData();
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("email", data.email);
  formData.append("mobileNumber", data.mobileNumber);
  formData.append("state", data.state);
  formData.append("branch", data.branch);

  if (data.profilePicture) {
    formData.append("profilePicture", data.profilePicture);
  }

  try {
    setIsCreatingCustomer(true);
    const res = await createCustomerMutation.mutateAsync(formData);

    setCustomerId(res?.id); 
    setStep(2);
  } finally {
    setIsCreatingCustomer(false);
  }
};

  // Step 2 submit
  const submitStep2 = async () => {
  if (!customerId) return;

  const formData = new FormData();
  formData.append("guarantorName", data.guarantorName);
  formData.append("guarantorRelationship", data.guarantorRelationship);
  formData.append("guarantorPhone", data.guarantorPhone);
  formData.append("guarantorAddress", data.guarantorAddress);
  formData.append("guarantorEmail", data.guarantorEmail);

  if (data.guarantorPicture) {
    formData.append("guarantorPicture", data.guarantorPicture);
  }

  try {
    setIsUpdatingGuarantor(true);
    await guarantorMutation.mutateAsync(formData);
    setStep(3);
  } finally {
    setIsUpdatingGuarantor(false);
  }
};


  // Start flow
  const start = () => {
    setOpen(true);
    setStep(1);
  };

  // Close flow
  const close = () => {
    setOpen(false);
    setStep(1);
    setIdStep("upload");
    setEntryMode("upload");
    setCapturedFile(null);
    setCapturedPreview(null);
    setData(initialData);
    setCustomerId(undefined);
  };

  // Navigation
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Update field
  const updateField = (field: string, value: string | File | null) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Capture ID file
  const captureIDFile = (file: File) => {
    setData((prev) => ({ ...prev, idCardFile: file }));
  };

  // Capture selfie
  const captureSelfieFile = (file: File) => {
    setData((prev) => ({ ...prev, selfieFile: file }));
  };

  // Submit final step
  const submitFinal = () => {
    console.log("Final submit →", data);
    close();
  };

  // ID Verification handlers
  const handleCapture = (file: File) => {
    setCapturedFile(file);
    setCapturedPreview(URL.createObjectURL(file));
    captureIDFile(file);
  };

  const handleOpenCamera = () => {
    setEntryMode("camera");
    setCapturedFile(null);
    setCapturedPreview(null);
    setIdStep("selfie");
  };

  const handleFileUploadNext = () => {
    setEntryMode("upload");
    setIdStep("selfie");
  };

  const handleIDBack = () => {
    if (idStep === "selfie") {
      setIdStep("upload");
      if (entryMode === "camera") {
        setCapturedFile(null);
        setCapturedPreview(null);
      }
    } else {
      prevStep();
    }
  };

  return (
    <FlowContext.Provider
      value={{
        open,
        step,
        data,
        customerId,

        idStep,
        entryMode,
        capturedFile,
        capturedPreview,

        isCreatingCustomer,
        isUpdatingGuarantor,

        start,
        close,
        nextStep,
        prevStep,

        updateField,

        submitStep1,
        submitStep2,
        submitFinal,

        captureIDFile,
        captureSelfieFile,

        handleOpenCamera,
        handleFileUploadNext,
        handleIDBack,
        handleCapture,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useCustomerFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error("useCustomerFlow must be used inside AddCustomerFlowProvider");
  }
  return ctx;
}
