import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import { processQR, QRResult } from "@/pages/PhotosPage/imageProcessor";

export function useQR() {
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { impact } = useHaptics();

  const performQR = async (imageData: string) => {
    if (!imageData) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    impact("medium");

    try {
      setProgress(25);
      const { result, error: qrError } = await processQR(imageData);
      setProgress(100);
      setQrResult(result);
      if (qrError) setError(qrError);
    } catch (err) {
      setError("QR processing failed. Please try again.");
      console.error("QR Error:", err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const clearQR = () => {
    setQrResult(null);
    setError(null);
    setProgress(0);
  };

  return { qrResult, loading, progress, error, performQR, clearQR };
}
