import { useState } from "react";
import { useHaptics } from "./useHaptics";

export function useClipboard() {
  const [showCopied, setShowCopied] = useState(false);
  const { impact } = useHaptics();

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    impact("light");

    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return { copyToClipboard, showCopied };
}
