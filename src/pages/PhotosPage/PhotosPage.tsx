import { List } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import { generateQR } from "./imageProcessor";
import { useHaptics } from "@/hooks/useHaptics";
import { OCRSection } from "./OCRSection";
import { QRSection } from "./QRSection";
import { BarCodeSection } from "./BarCodeSection";

import styles from "./PhotosPage.module.css";

export type Mode = "none" | "ocr" | "qr" | "barcode";

export function PhotosPage() {
  const [mode, setMode] = useState<Mode>("none");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const { impact } = useHaptics();

  const handleGenerateQR = async (text: string) => {
    impact("light");
    try {
      const qrDataURL = await generateQR(text);
      setGeneratedQR(qrDataURL);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  const handleShareQR = async () => {
    if (!generatedQR) return;
    impact("light");

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
    <List className={styles.listContainer}>
      <OCRSection
        mode={mode}
        setMode={setMode}
        generatedQR={generatedQR}
        handleGenerateQR={handleGenerateQR}
        handleShareQR={handleShareQR}
      />

      <QRSection
        mode={mode}
        setMode={setMode}
        generatedQR={generatedQR}
        handleGenerateQR={handleGenerateQR}
        handleShareQR={handleShareQR}
      />

      <BarCodeSection />
    </List>
  );
}
