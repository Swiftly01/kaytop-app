
import React, { useRef, useState, useEffect } from "react";
import { Loader2, Check, Camera, User } from "lucide-react";
import Button from "@/app/_components/ui/Button";
import { useUpdateIdVerification } from "../../queries/useUpdateIdVerification";
import { useUpdateVerificationStatus } from "../../queries/useUpdateVerificationStatus";


type VerificationStatus = "guideline" | "preview" | "processing" | "verified";
type EntryMode = "camera" | "upload";

interface Step4SelfieProps {
  customerId: number;
  onNext: () => void;
  onBack: () => void;
  onCapture: (file: File) => void;
  uploadedFile?: File | null;
  uploadedPreview?: string | null;
  mode: EntryMode;
}

export default function Step4Selfie({
  customerId,
  onNext,
  onBack,
  onCapture,
  uploadedFile,
  uploadedPreview,
  mode,
}: Step4SelfieProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(uploadedPreview || null);
  const [file, setFile] = useState<File | null>(uploadedFile || null);
  const [status, setStatus] = useState<VerificationStatus>(
    uploadedFile ? "preview" : "guideline"
  );
  const [cameraActive, setCameraActive] = useState(mode === "camera");
  const idVerificationMutation = useUpdateIdVerification(customerId!);
const statusMutation = useUpdateVerificationStatus(customerId!);

  // Start camera for camera mode
  useEffect(() => {
    if (mode === "camera" && !preview) {
      startCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const snappedFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setFile(snappedFile);
      setPreview(URL.createObjectURL(snappedFile));
      onCapture(snappedFile);
      setStatus("preview");
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const handleVerify = async () => {
  if (!file) return;

  setStatus("processing");

  const formData = new FormData();
  formData.append("idType", "government-id"); // or dynamic later
  formData.append("idNumber", "N/A"); // optional if backend allows
  formData.append("idPicture", file);

  try {
    await idVerificationMutation.mutateAsync(formData);

    // ✅ mark verified
    await statusMutation.mutateAsync("verified");

    setStatus("verified");
  } catch (err) {
    console.error(err);
    setStatus("preview");
    alert("Verification failed, please try again");
  }
};


  const handleRetake = () => {
    setPreview(null);
    setFile(null);
    setStatus("guideline");
    if (mode === "camera") {
      startCamera();
    }
  };

  const handleContinue = () => {
    if (status === "verified") {
      onNext();
    } else if (mode === "upload" && file) {
      handleVerify();
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "guideline":
        return {
          title: "Valid Government ID",
          items: [
            "Make sure you are in a well-lit environment",
            "Center your ID clearly in the frame below",
            "Click the button below when you are ready",
          ],
        };
      case "preview":
        return {
          title: "Valid Government ID",
          items: [
            "Make sure you are in a well-lit environment",
            "Center your ID clearly in the frame below",
            "Click Verify when ready to proceed",
          ],
        };
      case "processing":
        return {
          title: "Processing photo ID",
          items: [
            "Analyzing your document...",
            "Verifying authenticity...",
            "Please wait a moment...",
          ],
        };
      case "verified":
        return {
          title: "Photo ID verified",
          items: [
            "Your ID has been verified successfully",
            "You can now proceed to the next step",
            "Click Continue to finish",
          ],
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-foreground">Verify Your ID</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Tell us about your customer. It only takes a few minutes.
      </p>

      <div className="flex gap-6 mt-6">
        {/* LEFT SIDE — Instructions + Status */}
        <div className="w-[50%]">
          <p className="text-sm font-semibold text-foreground mb-4">
            {statusContent.title}
          </p>

          <ul className="space-y-3">
            {statusContent.items.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[hsl(262,83%,58%)] mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Status Indicator */}
          {status === "processing" && (
            <div className="mt-6 flex items-center gap-3 text-[hsl(262,83%,58%)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}

          {status === "verified" && (
            <div className="mt-6 flex items-center gap-3 text-green-600">
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Verified Successfully</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE — Camera / Preview */}
        <div className="w-[50%]">
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-4/3">
            {/* Corner Brackets */}
            <div className="absolute inset-4 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[hsl(262,83%,58%)] rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[hsl(262,83%,58%)] rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[hsl(262,83%,58%)] rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[hsl(262,83%,58%)] rounded-br-lg" />
            </div>

            {preview ? (
              <img
                src={preview}
                alt="Captured ID"
                className={`w-full h-full object-cover transition-opacity ${
                  status === "processing" ? "opacity-60" : ""
                }`}
              />
            ) : cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <User className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-sm">Camera preview</p>
              </div>
            )}

            {/* Processing Overlay */}
            {status === "processing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <p className="text-white text-sm mt-2 font-medium">Processing photo ID</p>
              </div>
            )}

            {/* Verified Overlay */}
            {status === "verified" && (
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6 gap-3">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1 py-2 text-sm bg-gray-200"
        >
          Cancel
        </Button>

        {mode === "camera" && !preview ? (
          <Button
            onClick={handleCapture}
             variant="tertiary"
             className="flex w-1/2 items-center justify-center gap-2 py-2 text-sm"
            disabled={!cameraActive}
          >
            <Camera className="w-4 h-4" />
            Capture
          </Button>
        ) : status === "preview" ? (
          <Button
           variant="tertiary"
            onClick={handleVerify}
            className="flex-1 py-2 text-sm"
          >
            Verify
          </Button>
        ) : status === "verified" ? (
          <Button
           variant="tertiary"
            onClick={handleContinue}
            className="flex-1 py-2 text-sm"
          >
            Continue
          </Button>
        ) : (
          <Button
           variant="tertiary"
            className="flex-1 py-2 text-sm"
            disabled
          >
            Continue
          </Button>
        )}
      </div>

      {/* Retake Option */}
      {preview && status !== "processing" && status !== "verified" && (
        <button
          onClick={handleRetake}
          className="w-full text-center text-sm text-[hsl(262,83%,58%)] hover:underline mt-3"
        >
          Retake photo
        </button>
      )}
    </div>
  );
}


