import { useRef, useState } from "react";

export function useImagePicker() {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickImage = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selected file is not an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    image,
    error,
    fileInputRef,
    pickImage,
    handleFileSelect,
    clearImage,
  };
}
