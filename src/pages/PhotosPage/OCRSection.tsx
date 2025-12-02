import { Section, Cell } from "@telegram-apps/telegram-ui";
import styles from "./PhotosPage.module.css";
import { useOCR } from "@/hooks/useOCR";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useClipboard } from "@/hooks/useClipboard";
import { Mode } from "./PhotosPage";

interface OCRSectionProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  generatedQR: string | null;
  handleGenerateQR: (text: string) => void;
  handleShareQR: () => void;
}

export function OCRSection({
  mode,
  setMode,
  generatedQR,
  handleGenerateQR,
  handleShareQR,
}: OCRSectionProps) {
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
  };

  return (
    <Section header="Document OCR">
      <div>
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => {
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
        {ocrResult && (
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
                onClick={() => handleGenerateQR(ocrResult.text)}
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

        {mode === "ocr" && image && (
          <Cell subtitle="Clear data" onClick={handleClear}>
            Reset
          </Cell>
        )}

        {showCopied && (
          <div className={styles.copiedPopup}>Text copied to clipboard</div>
        )}
      </div>
    </Section>
  );
}
