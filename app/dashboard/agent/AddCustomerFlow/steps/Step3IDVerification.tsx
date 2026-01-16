import React from "react";
import { useCustomerFlow } from "../AddCustomerFlowProvider";
import Step4Selfie from "./Step4Selfie";
import Step3UploadID from "./Step3UploadID";


export default function Step3IDVerification() {
  const {
    customerId,
    idStep,
    entryMode,
    capturedFile,
    capturedPreview,
    handleOpenCamera,
    handleFileUploadNext,
    handleIDBack,
    handleCapture,
    submitFinal,
  } = useCustomerFlow();

  if (idStep === "upload") {
    return (
      <Step3UploadID
        onNext={handleFileUploadNext}
        onBack={handleIDBack}
        onCapture={handleCapture}
        openCamera={handleOpenCamera}
      />
    );
  }

  return (
    <Step4Selfie
    customerId={customerId!}
      onNext={submitFinal}
      onBack={handleIDBack}
      onCapture={handleCapture}
      uploadedFile={entryMode === "upload" ? capturedFile : null}
      uploadedPreview={entryMode === "upload" ? capturedPreview : null}
      mode={entryMode}
    />
  );
}
