import { cleanOCRText } from "@/utils/cleanOCRText";
import { createWorker } from "tesseract.js";
import { BrowserQRCodeReader } from "@zxing/browser";
import QRCode from "qrcode";

export async function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;

    img.onload = () => {
      const maxSize = 1500;
      let { width, height } = img;

      // scale down to avoid Tesseract memory crash
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const imageDataObj = ctx.getImageData(0, 0, width, height);
      const data = imageDataObj.data;

      // grayscale + soft threshold
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        const value = avg > 140 ? 255 : 0;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx.putImageData(imageDataObj, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject("Invalid image");
  });
}

function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const arr = dataURL.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr.buffer;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface QRResult {
  text: string;
}

export async function processOCR(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const worker = await createWorker("eng", 1, {
    logger: (m: any) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const preprocessed = await preprocessImage(imageData);

  await worker.setParameters({
    tessedit_ocr_engine_mode: "1",
    user_defined_dpi: "300",
  });

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(preprocessed);
    const cleanedText = cleanOCRText(text);
    return { text: cleanedText, confidence };
  } finally {
    await worker.terminate();
  }
}

export async function processQR(
  imageData: string
): Promise<{ result: QRResult | null; error?: string }> {
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      console.error("QR processing timeout");
      resolve({
        result: null,
        error:
          "QR processing timed out. The image may be too complex or corrupted.",
      });
    }, 5000); // 5 second timeout

    try {
      // Convert data URL to array buffer for EXIF
      try {
        dataURLToArrayBuffer(imageData);
      } catch (conversionError) {
        console.error("Data URL conversion failed:", conversionError);
        resolve({
          result: null,
          error: "Invalid image format. Please upload a valid image file.",
        });
        return;
      }

      let orientation = 1;

      const img = new Image();
      img.src = imageData;

      const imageLoadTimeout = setTimeout(() => {
        console.error("Image loading timeout");
        resolve({
          result: null,
          error:
            "Image loading timed out. The image may be corrupted or too large.",
        });
      }, 2000);

      img.onload = async () => {
        clearTimeout(timeout);
        clearTimeout(imageLoadTimeout);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("Canvas 2D context not available");
            resolve({
              result: null,
              error: "Canvas rendering not supported in this browser.",
            });
            return;
          }

          // Apply EXIF orientation
          let { width, height } = img;
          let rotation = 0;
          let flipHorizontal = false;
          let flipVertical = false;

          switch (orientation) {
            case 2:
              flipHorizontal = true;
              break;
            case 3:
              rotation = 180;
              break;
            case 4:
              flipVertical = true;
              break;
            case 5:
              rotation = 90;
              flipHorizontal = true;
              break;
            case 6:
              rotation = 90;
              break;
            case 7:
              rotation = 270;
              flipHorizontal = true;
              break;
            case 8:
              rotation = 270;
              break;
          }

          if (rotation === 90 || rotation === 270) {
            [width, height] = [height, width];
          }

          // Resize if too large for better processing
          const maxSize = 1024;
          let scale = 1;
          if (width > maxSize || height > maxSize) {
            scale = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }

          canvas.width = width;
          canvas.height = height;

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          if (rotation) ctx.rotate((rotation * Math.PI) / 180);
          if (flipHorizontal) ctx.scale(-1, 1);
          if (flipVertical) ctx.scale(1, -1);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();

          const codeReader = new BrowserQRCodeReader();
          const result = codeReader.decodeFromCanvas(canvas);

          if (result == null || !result.getText()) {
            return resolve({
              result: null,
              error: "No QR code found in the image.",
            });
          }

          resolve({ result: { text: result.getText() } });
          console.log("QR detected successfully");
        } catch (error) {
          console.error("QR detection failed:", error);
          let errorMessage = "QR code not found in the image.";
          if (error instanceof Error) {
            if (error.message.includes("No QR code found")) {
              errorMessage =
                "No QR code detected. Ensure the QR code is clearly visible, well-lit, and not distorted.";
            } else if (error.message.includes("timeout")) {
              errorMessage =
                "QR detection timed out. The image may be too large or complex.";
            } else {
              errorMessage = `QR detection error: ${error.message}`;
            }
          }
          resolve({ result: null, error: errorMessage });
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        clearTimeout(imageLoadTimeout);
        console.error("Image loading failed");
        resolve({
          result: null,
          error: "Failed to load the image. Please try uploading again.",
        });
      };
    } catch (error) {
      clearTimeout(timeout);
      console.error("QR processing setup failed:", error);
      resolve({
        result: null,
        error:
          "Failed to process the image. Please ensure it's a valid image file.",
      });
    }
  });
}

export async function processBarcode(imageData: string): Promise<any> {
  // TODO: Implement barcode recognition
  console.log(imageData);
  throw new Error("Barcode processing not implemented yet");
}

export async function generateQR(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}
