import { Section, Cell, List } from "@telegram-apps/telegram-ui";
import { useState, useRef } from "react";
import {
  processOCR,
  processQR,
  generateQR,
  type OCRResult,
  type QRResult,
} from "./imageProcessor";
import styles from "./PhotosPage.module.css";
import { useHaptics } from "@/hooks/useHaptics";

type Mode = "none" | "ocr" | "qr" | "barcode";

export function PhotosPage() {
  const [mode, setMode] = useState<Mode>("none");
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [qrInputText, setQrInputText] = useState<string>("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [qrProgress, setQrProgress] = useState<number>(0);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [showQRTextInput, setShowQRTextInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { impact } = useHaptics();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setOcrResult(null);
        setQrResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const performOCR = async (imageData: string) => {
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

  const performQR = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setQrProgress(0);
    impact("medium");
    try {
      setQrProgress(25);
      const { result, error } = await processQR(imageData);
      setQrProgress(100);
      setQrResult(result);
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError("QR processing failed. Please try again.");
      console.error("QR Error:", err);
    } finally {
      setLoading(false);
      setQrProgress(0);
    }
  };

  const copyToClipboard = async (text: string) => {
    impact("light");
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      }
    }
  };

  const handleClearResults = () => {
    impact("light");
    setOcrResult(null);
    setQrResult(null);
    setGeneratedQR(null);
    setImage(null);
    setMode("none");
    setError(null);
    setQrInputText("");
    setShowQRTextInput(false);
  };

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

  const handleShowQRTextInput = () => {
    impact("light");
    setShowQRTextInput(true);
  };

  return (
    <List className={styles.listContainer}>
      <Section header="Document OCR">
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => {
            setMode("ocr");
            fileInputRef.current?.click();
          }}
        >
          Recognize text from image
        </Cell>
      </Section>

      {mode === "ocr" && image && (
        <>
          <div className={styles.imageContainer}>
            <img src={image} alt="Selected" className={styles.image} />
          </div>

          <Cell
            subtitle="Process image for text recognition"
            onClick={() => performOCR(image)}
            disabled={loading}
            className=""
          >
            {loading ? `Processing... ${progress}%` : "Extract Text (OCR)"}
          </Cell>
        </>
      )}

      {mode === "ocr" && error && (
        <div className={styles.errorContainer}>{error}</div>
      )}

      {mode === "ocr" && ocrResult && (
        <Section
          header={`Recognized Text (Quality: ${Math.round(
            ocrResult.confidence
          )}%)`}
        >
          <div className={styles.ocrResultContainer}>
            <div className={styles.ocrResult}>
              {ocrResult.text || "No text detected"}
            </div>
          </div>

          <div className={styles.buttonsContainer}>
            <Cell
              subtitle="Copy recognized text to clipboard"
              onClick={() => copyToClipboard(ocrResult!.text)}
              disabled={!ocrResult?.text}
            >
              Copy Text
            </Cell>

            <Cell
              subtitle="Generate QR code from text"
              onClick={() => handleGenerateQR(ocrResult!.text)}
              disabled={!ocrResult?.text}
            >
              Generate QR
            </Cell>
          </div>

          {generatedQR && (
            <>
              <div className={styles.imageContainer}>
                <img
                  src={generatedQR}
                  alt="Generated QR"
                  className={styles.image}
                />
              </div>
              <div className={styles.buttonsContainer}>
                <Cell subtitle="Share QR code" onClick={handleShareQR}>
                  Share
                </Cell>
              </div>
            </>
          )}
        </Section>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {image && mode === "ocr" && (
        <Cell subtitle="Clear data" onClick={handleClearResults}>
          Reset
        </Cell>
      )}

      {showCopiedPopup && (
        <div className={styles.copiedPopup}>Text copied to clipboard</div>
      )}

      <Section header="QR Code Scanner">
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => {
            setMode("qr");
            fileInputRef.current?.click();
          }}
        >
          Scan QR code
        </Cell>

        {mode === "qr" && image && (
          <>
            <div className={styles.imageContainer}>
              <img src={image} alt="Selected" className={styles.image} />
            </div>
            <Cell
              subtitle="Process image for QR code recognition"
              onClick={() => performQR(image)}
              disabled={loading}
            >
              {loading ? `Processing... ${qrProgress}%` : "Extract QR Code"}
            </Cell>
          </>
        )}

        {mode === "qr" && error && (
          <div className={styles.errorContainer}>{error}</div>
        )}

        {mode === "qr" && qrResult && (
          <Section header="Recognized QR Code">
            <div className={styles.resultContainer}>
              <div className={styles.ocrResult}>
                {qrResult.text || "No QR code data"}
              </div>
            </div>
            <div className={styles.buttonsContainer}>
              <Cell
                subtitle="Copy QR code data to clipboard"
                onClick={() => copyToClipboard(qrResult!.text)}
                disabled={!qrResult.text}
              >
                Copy
              </Cell>
            </div>
          </Section>
        )}

        {image && mode === "qr" && (
          <Cell subtitle="Reset data" onClick={handleClearResults}>
            Reset
          </Cell>
        )}

        {!image && (
          <>
            <Cell subtitle="QR Code Generator" onClick={handleShowQRTextInput}>
              Generate QR code from text
            </Cell>
            {showQRTextInput && (
              <textarea
                placeholder="Type or paste your text here"
                value={qrInputText}
                onChange={(e) => setQrInputText(e.target.value)}
                className={showQRTextInput ? styles.textInput : styles.hidden}
              />
            )}
            <Cell
              subtitle="Generate QR code"
              onClick={() => handleGenerateQR(qrInputText)}
              disabled={!qrInputText.trim()}
              className={!qrInputText.trim() ? styles.hiddenInput : ""}
            >
              Generate QR
            </Cell>

            {showQRTextInput && (
              <Cell
                subtitle="Reset"
                onClick={handleClearResults}
                className={showQRTextInput ? "" : styles.hidden}
              >
                Clear data
              </Cell>
            )}

            {generatedQR && qrInputText && (
              <>
                <div className={styles.imageContainer}>
                  <img
                    src={generatedQR}
                    alt="Generated QR"
                    className={styles.image}
                  />
                </div>
                <div className={styles.buttonsContainer}>
                  <Cell subtitle="Share QR code" onClick={handleShareQR}>
                    Share
                  </Cell>
                </div>
              </>
            )}
          </>
        )}
      </Section>

      <Section header="Bar Code Scanner">
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          Recognize information from bar code
        </Cell>

        <Cell
          subtitle="Bar code generator"
          onClick={() => fileInputRef.current?.click()}
        >
          Generate bar code from text
        </Cell>
      </Section>
    </List>
  );
}
