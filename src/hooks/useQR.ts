import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import {
  processQR,
  generateQR,
  QRResult,
} from "@/pages/PhotosPage/imageProcessor";

export function useQR() {
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
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
      const { result, error: qrError } = await Promise.race([
        processQR(imageData),
        new Promise<{ result: QRResult | null; error?: string }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                result: null,
                error: "QR processing timed out. Please try again.",
              }),
            10000
          )
        ),
      ]);

      if (!result || error) {
        setError(qrError || "No QR code found in the image.");
        setLoading(false);
        setProgress(0);
        return;
      }
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

  const generateQRCode = async (text: string) => {
    if (!text) return;

    setLoading(true);
    setError(null);
    impact("light");

    try {
      const qrDataURL = await generateQR(text);
      setGeneratedQR(qrDataURL);
    } catch (err) {
      console.error("QR generation failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setGeneratedQR(null);
    } finally {
      setLoading(false);
    }
  };

  const clearQR = () => {
    setQrResult(null);
    setGeneratedQR(null);
    setError(null);
    setProgress(0);
  };

  return {
    qrResult,
    generatedQR,
    loading,
    progress,
    error,
    performQR,
    generateQRCode,
    clearQR,
  };
}
