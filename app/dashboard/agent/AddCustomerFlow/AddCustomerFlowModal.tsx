"use client";

import { JSX } from "react";
import { useCustomerFlow } from "./AddCustomerFlowProvider";
import FlowModal from "./FlowModal";
import Step1Personal from "./steps/Step1Personal";
import Step2Guarantor from "./steps/Step2Guarantor";
import Step3IDVerification from "./steps/Step3IDVerification";





export default function AddCustomerFlowModal() {
  const { step } = useCustomerFlow();

  const steps: Record<number, JSX.Element> = {
     1: <Step1Personal />,
    2: <Step2Guarantor />,
    3: <Step3IDVerification />,
  };

  return <FlowModal>{steps[step]}</FlowModal>;
}
