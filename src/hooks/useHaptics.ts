import { hapticFeedback } from "@tma.js/sdk-react";
import { useCallback } from "react";
import { useAppStore } from "../store";

/**
 * Hook for triggering haptic feedback respecting user preferences
 */
export function useHaptics() {
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

  const impact = useCallback(
    (type: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      if (hapticsEnabled && hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred(type);
      }
    },
    [hapticsEnabled]
  );

  const notification = useCallback(
    (type: "success" | "error" | "warning") => {
      if (hapticsEnabled && hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred(type);
      }
    },
    [hapticsEnabled]
  );

  const selection = useCallback(() => {
    if (hapticsEnabled && hapticFeedback.selectionChanged.isAvailable()) {
      hapticFeedback.selectionChanged();
    }
  }, [hapticsEnabled]);

  return { impact, notification, selection };
}
