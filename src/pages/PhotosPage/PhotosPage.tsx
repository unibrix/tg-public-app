import { List } from "@telegram-apps/telegram-ui";
import { useState, createContext, useContext } from "react";
import { useQR } from "@/hooks/useQR";
import { OCRSection } from "./OCRSection";
import { QRSection } from "./QRSection";

import styles from "./PhotosPage.module.css";

export type Mode = "none" | "ocr" | "qr" | "barcode";

interface QRContextType {
  generatedQR: string | null;
  error: string | null;
  generateQRCode: (text: string) => Promise<void>;
  clearQR: () => void;
}

const QRContext = createContext<QRContextType | null>(null);

export const useQRContext = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error("useQRContext must be used within QRProvider");
  }
  return context;
};

export function PhotosPage() {
  const [mode, setMode] = useState<Mode>("none");
  const { generatedQR, error, generateQRCode, clearQR } = useQR();

  const qrContextValue = {
    generatedQR,
    error,
    generateQRCode,
    clearQR,
  };

  const handleShareQR = async () => {
    if (!generatedQR) return;

    try {
      // Convert data URL to blob
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      const file = new File([blob], "qr-code.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "QR Code",
          text: "Generated QR Code",
          files: [file],
        });
      } else {
        // Fallback: download or copy
        const link = document.createElement("a");
        link.href = generatedQR;
        link.download = "qr-code.png";
        link.click();
      }
    } catch (err) {
      console.error("Share failed:", err);
      // Fallback to download
      const link = document.createElement("a");
      link.href = generatedQR;
      link.download = "qr-code.png";
      link.click();
    }
  };

  return (
    <QRContext.Provider value={qrContextValue}>
      <List className={styles.listContainer}>
        <OCRSection
          mode={mode}
          setMode={setMode}
          handleShareQR={handleShareQR}
        />

        <QRSection
          mode={mode}
          setMode={setMode}
          handleShareQR={handleShareQR}
        />
      </List>
    </QRContext.Provider>
  );
}
