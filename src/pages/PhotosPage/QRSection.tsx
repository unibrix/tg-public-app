import { useState } from "react";
import { Section, Cell } from "@telegram-apps/telegram-ui";
import styles from "./PhotosPage.module.css";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useQR } from "@/hooks/useQR";
import { useClipboard } from "@/hooks/useClipboard";

import type { Mode } from "./PhotosPage";

interface QRSectionProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  generatedQR: string | null;
  handleGenerateQR: (text: string) => void;
  handleShareQR: () => void;
}

export function QRSection({
  mode,
  setMode,
  generatedQR,
  handleGenerateQR,
  handleShareQR,
}: QRSectionProps) {
  const { image, fileInputRef, pickImage, handleFileSelect, clearImage } =
    useImagePicker();

  const {
    qrResult,
    performQR,
    loading,
    progress: qrProgress,
    error,
    clearQR,
  } = useQR();

  const { copyToClipboard, showCopied } = useClipboard();
  const [qrInputText, setQrInputText] = useState<string>("");
  const [showQRTextInput, setShowQRTextInput] = useState(false);

  const handleShowQRTextInput = () => setShowQRTextInput(true);
  const handleClearResults = () => {
    clearImage();
    setQrInputText("");
    setShowQRTextInput(false);
    clearQR();
  };

  return (
    <Section header="QR Code Scanner">
      <Cell
        subtitle="Take photo or upload image"
        onClick={() => {
          setMode("qr");
          pickImage();
        }}
      >
        Scan QR code
      </Cell>
      <div>
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
                onClick={() => copyToClipboard(qrResult.text)}
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
                subtitle="Clear data"
                onClick={handleClearResults}
                className={showQRTextInput ? "" : styles.hidden}
              >
                Clear
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />
        {showCopied && (
          <div className={styles.copiedPopup}>Text copied to clipboard</div>
        )}
      </div>
    </Section>
  );
}
