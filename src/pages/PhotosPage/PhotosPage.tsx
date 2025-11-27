import { Section, Cell, List } from "@telegram-apps/telegram-ui";
import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";

interface OCRResult {
  text: string;
  confidence: number;
}

export function PhotosPage() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setOcrResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setImage(imageData);
        setOcrResult(null);
        setError(null);
        stopCamera();
      }
    }
  };

  const performOCR = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const timeout = setTimeout(() => {
      setError("OCR processing timed out. Please try again.");
      setLoading(false);
      setProgress(0);
    }, 30000); // 30 second timeout

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const {
        data: { text, confidence },
      } = await worker.recognize(imageData);
      await worker.terminate();

      clearTimeout(timeout);
      const cleanedText = cleanOCRText(text);
      setOcrResult({ text: cleanedText, confidence });
    } catch (err) {
      clearTimeout(timeout);
      setError("OCR processing failed. Please try again.");
      console.error("OCR Error:", err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const cleanOCRText = (text: string): string => {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n")
      .replace(/[^\w\s\n.,!?-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const copyToClipboard = async () => {
    if (ocrResult?.text) {
      try {
        await navigator.clipboard.writeText(ocrResult.text);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = ocrResult.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      }
    }
  };

  return (
    <List style={{ paddingBottom: "100px" }}>
      <Section header="Document OCR">
        <Cell
          subtitle="Take photo or upload image"
          onClick={() => fileInputRef.current?.click()}
        >
          Recognize text from image
        </Cell>

        {/* {cameraActive && (
          <Cell subtitle="Close camera" onClick={stopCamera}>
            Stop Camera
          </Cell>
        )} */}
      </Section>

      {cameraActive && (
        <Section header="Camera">
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            {/* <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} /> */}
          </div>
        </Section>
      )}

      {image && (
        <Section header="Selected Image">
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              padding: "16px",
            }}
          >
            <img
              src={image}
              alt="Selected"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
              }}
            />
          </div>
          <Cell
            subtitle="Process image for text recognition"
            onClick={() => performOCR(image)}
            disabled={loading}
          >
            {loading ? `Processing... ${progress}%` : "Extract Text (OCR)"}
          </Cell>
        </Section>
      )}

      {ocrResult && (
        <Section
          header={`Recognized Text (Quality: ${Math.round(
            ocrResult.confidence
          )}%)`}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              borderRadius: "8px",
              marginBottom: "16px",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: "14px",
              maxHeight: "200px",
              overflowY: "auto",
              overflowX: "hidden",
              textWrap: "wrap",
            }}
          >
            {ocrResult.text || "No text detected"}
          </div>
          <div style={{ paddingBottom: "20px" }}>
            <Cell
              subtitle="Copy recognized text to clipboard"
              onClick={copyToClipboard}
              disabled={!ocrResult.text}
            >
              Copy to Clipboard
            </Cell>

            <Cell
              subtitle="Clear recognized text"
              onClick={copyToClipboard}
              disabled={!ocrResult.text}
            >
              Clear text
            </Cell>
          </div>
        </Section>
      )}

      {error && (
        <Section header="Error">
          <Cell subtitle="OCR processing error">{error}</Cell>
        </Section>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {showCopiedPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "25%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          Text copied to clipboard
        </div>
      )}
    </List>
  );
}
