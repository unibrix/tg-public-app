import { Section, Cell } from "@telegram-apps/telegram-ui";
import styles from "./PhotosPage.module.css";
import { useOCR } from "@/hooks/useOCR";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useClipboard } from "@/hooks/useClipboard";
import { Mode, useQRContext } from "./PhotosPage";

interface OCRSectionProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  handleShareQR: () => void;
}

export function OCRSection({ mode, setMode, handleShareQR }: OCRSectionProps) {
  const { generatedQR, error, generateQRCode, clearQR } = useQRContext();
  const { image, fileInputRef, pickImage, handleFileSelect, clearImage } =
    useImagePicker();
  const {
    ocrResult,
    performOCR,
    loading,
    progress,
    error: ocrError,
    clearOCR,
  } = useOCR();
  const { copyToClipboard, showCopied } = useClipboard();

  const handleClear = () => {
    clearImage();
    clearOCR();
    clearQR();
    setMode("none");
  };

  return (
    <Section header="Document OCR">
      <div>
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => {
            handleClear();
            setMode("ocr");
            pickImage();
          }}
        >
          Recognize text from image
        </Cell>
        {mode === "ocr" && image && (
          <>
            <div className={styles.imageContainer}>
              <img src={image} alt="Selected" className={styles.image} />
            </div>

            <Cell
              subtitle="Process image for text recognition"
              onClick={() => performOCR(image)}
              disabled={loading}
            >
              {loading ? `Processing... ${progress}%` : "Extract Text (OCR)"}
            </Cell>
          </>
        )}
        {mode === "ocr" && ocrError && (
          <div className={styles.errorContainer}>{ocrError}</div>
        )}
        {mode === "ocr" && ocrResult && (
          <div className={styles.resultContainer}>
            <div className={styles.ocrResult}>
              {ocrResult.text || "No text detected"}
            </div>

            <div className={styles.buttonsContainer}>
              <Cell
                subtitle="Copy recognized text to clipboard"
                onClick={() => copyToClipboard(ocrResult.text)}
                disabled={!ocrResult?.text}
              >
                Copy Text
              </Cell>

              <Cell
                subtitle="Generate QR code from text"
                onClick={() => generateQRCode(ocrResult.text)}
                disabled={!ocrResult?.text}
              >
                Generate QR
              </Cell>
            </div>

            {mode === "ocr" && generatedQR && (
              <>
                <div className={styles.imageContainer}>
                  <img
                    src={generatedQR}
                    alt="Generated QR"
                    className={styles.image}
                  />
                </div>
                <Cell subtitle="Share QR code" onClick={handleShareQR}>
                  Share
                </Cell>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />

        {mode === "ocr" && error && (
          <div className={styles.errorContainer}>{error}</div>
        )}

        {mode === "ocr" && image && (
          <Cell subtitle="Clear data" onClick={handleClear}>
            Reset
          </Cell>
        )}

        {mode === "ocr" && showCopied && (
          <div className={styles.copiedPopup}>Text copied to clipboard</div>
        )}
      </div>
    </Section>
  );
}
