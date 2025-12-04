import { useState } from "react";
import { Section, Cell } from "@telegram-apps/telegram-ui";
import styles from "./PhotosPage.module.css";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useQR } from "@/hooks/useQR";
import { useClipboard } from "@/hooks/useClipboard";

import type { Mode } from "./PhotosPage";
import { useQRContext } from "./PhotosPage";

interface QRSectionProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  handleShareQR: () => void;
}

export function QRSection({ mode, setMode, handleShareQR }: QRSectionProps) {
  const {
    generatedQR,
    error: generatedError,
    generateQRCode,
    clearQR: clearGeneratedQR,
  } = useQRContext();
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

  const handleShowQRTextInput = () => {
    handleClearResults();
    setShowQRTextInput(true);
    setMode("qr");
  };

  const handleClearResults = () => {
    clearImage();
    setQrInputText("");
    setShowQRTextInput(false);
    clearQR();
    clearGeneratedQR();
    setMode("none");
  };

  return (
    <Section header="QR Code Scanner">
      <Cell
        subtitle="Take photo or upload image"
        onClick={() => {
          handleClearResults();
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

            {mode === "qr" && showQRTextInput && (
              <textarea
                placeholder="Type or paste your text here"
                value={qrInputText}
                onChange={(e) => setQrInputText(e.target.value)}
                className={showQRTextInput ? styles.textInput : styles.hidden}
              />
            )}

            <Cell
              subtitle="Generate QR code"
              onClick={() => {
                generateQRCode(qrInputText);
                setMode("qr");
              }}
              disabled={!qrInputText.trim()}
              className={!qrInputText.trim() ? styles.hiddenInput : ""}
            >
              Generate QR
            </Cell>

            {generatedError && mode === "qr" && (
              <div className={styles.errorContainer}>{generatedError}</div>
            )}

            {mode === "qr" && showQRTextInput && (
              <Cell
                subtitle="Clear data"
                onClick={handleClearResults}
                className={showQRTextInput ? "" : styles.hidden}
              >
                Clear
              </Cell>
            )}

            {mode === "qr" && generatedQR && qrInputText && (
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

        {mode === "qr" && showCopied && (
          <div className={styles.copiedPopup}>Text copied to clipboard</div>
        )}
      </div>
    </Section>
  );
}
