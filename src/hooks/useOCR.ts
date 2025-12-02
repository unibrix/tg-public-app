import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import { OCRResult, processOCR } from "@/pages/PhotosPage/imageProcessor";

export function useOCR() {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { impact } = useHaptics();

  const performOCR = async (imageData: string) => {
    if (!imageData) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    impact("medium");

    const timeout = setTimeout(() => {
      setError("OCR processing timed out. Please try again.");
      setLoading(false);
      setProgress(0);
    }, 30000); // 30 second timeout

    try {
      const result = await processOCR(imageData, (p) => setProgress(p));
      clearTimeout(timeout);
      setOcrResult(result);
    } catch (err) {
      clearTimeout(timeout);
      setError("OCR processing failed. Please try again.");
      console.error("OCR Error:", err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const clearOCR = () => {
    setOcrResult(null);
    setError(null);
    setProgress(0);
  };

  return { ocrResult, loading, progress, error, performOCR, clearOCR };
}
