export const cleanOCRText = (text: string): string => {
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
