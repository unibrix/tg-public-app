import { biometry, hapticFeedback, popup } from "@tma.js/sdk-react";
import { useCallback, useState } from "react";
import { useAppStore } from "../store";

/**
 * Show error popup to user via Telegram's native modal
 */
const showErrorPopup = (message: string) => {
  try {
    if (popup.isSupported()) {
      popup.show({
        title: "Authentication Error",
        message,
        buttons: [{ type: "ok" }],
      });
    }
  } catch {
    // Ignore popup errors
  }
};

type BiometricStatus =
  | "idle"
  | "checking"
  | "requesting_access"
  | "authenticating"
  | "authorized"
  | "denied"
  | "unavailable"
  | "error";

interface BiometricResult {
  success: boolean;
  status: BiometricStatus;
  error?: string;
}

interface UseBiometricAuthOptions {
  /** Enable console logging for debugging */
  debug?: boolean;
}

/**
 * Reusable hook for biometric authentication in TMA
 * Handles the full flow: availability check → access request → authentication
 */
export function useBiometricAuth(options: UseBiometricAuthOptions = {}) {
  const { debug = false } = options;
  const [status, setStatus] = useState<BiometricStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const biometryEnabled = useAppStore((s) => s.biometryEnabled);

  const log = useCallback(
    (message: string, data?: unknown) => {
      if (debug) {
        console.log(`[Biometry] ${message}`, data ?? "");
      }
    },
    [debug]
  );

  const triggerHaptic = useCallback(
    (type: "success" | "error" | "warning") => {
      if (hapticsEnabled && hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred(type);
      }
    },
    [hapticsEnabled]
  );

  /**
   * Check if biometry is available on this device/platform
   */
  const isAvailable = useCallback((): boolean => {
    const mounted = biometry.isMounted();
    const authAvailable = biometry.authenticate.isAvailable();
    log("Availability check", { mounted, authAvailable });
    return mounted && authAvailable;
  }, [log]);

  /**
   * Get current biometry state
   */
  const getState = useCallback(() => {
    try {
      return biometry.state();
    } catch {
      return null;
    }
  }, []);

  /**
   * Request biometry access from user (only needed once per bot)
   */
  const requestAccess = useCallback(
    async (reason?: string): Promise<boolean> => {
      log("Requesting access...");
      setStatus("requesting_access");

      try {
        const state = biometry.state();
        if (state.accessGranted) {
          log("Access already granted");
          return true;
        }

        if (!biometry.requestAccess.isAvailable()) {
          log("requestAccess not available");
          return false;
        }

        const granted = await biometry.requestAccess({
          reason: reason || "Enable biometric authentication",
        });

        log("Access request result", { granted });

        // Re-mount to refresh state after access request
        if (granted && biometry.mount.isAvailable()) {
          log("Re-mounting to refresh state...");
          try {
            await biometry.mount();
            log("Re-mounted, new state:", biometry.state());
          } catch {
            // Ignore mount errors, proceed with auth
          }
        }

        return granted;
      } catch (err) {
        log("Access request error", err);
        return false;
      }
    },
    [log]
  );

  /**
   * Open biometry settings (must be called from user interaction)
   */
  const openSettings = useCallback(() => {
    if (biometry.openSettings.isAvailable()) {
      log("Opening biometry settings...");
      biometry.openSettings();
    } else {
      log("openSettings not available");
    }
  }, [log]);

  /**
   * Execute a secure operation with biometric authentication
   * @param onSuccess - Callback to execute if authentication succeeds
   * @param reason - Reason shown to user in biometry prompt
   * @returns BiometricResult with success status
   */
  const withBiometricAuth = useCallback(
    async <T>(
      onSuccess: () => T | Promise<T>,
      reason: string
    ): Promise<BiometricResult & { result?: T }> => {
      setError(null);
      log("Starting biometric auth flow", { reason, biometryEnabled });

      // Skip biometry if disabled in settings
      if (!biometryEnabled) {
        log("Biometry disabled in settings, executing without auth");
        try {
          const result = await onSuccess();
          triggerHaptic("success");
          setStatus("idle");
          return { success: true, status: "idle", result };
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          setError(errorMsg);
          setStatus("error");
          return { success: false, status: "error", error: errorMsg };
        }
      }

      // Step 1: Check availability
      setStatus("checking");
      if (!isAvailable()) {
        log("Biometry not available, executing without auth");
        setStatus("unavailable");
        // Execute callback without biometry (fallback)
        try {
          const result = await onSuccess();
          triggerHaptic("success");
          setStatus("idle");
          return { success: true, status: "unavailable", result };
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          setError(errorMsg);
          setStatus("error");
          return { success: false, status: "error", error: errorMsg };
        }
      }

      // Step 2: Ensure access is granted
      const state = biometry.state();
      log("Current state", state);

      if (!state.accessGranted) {
        const granted = await requestAccess(
          "Secure your actions with biometrics"
        );
        if (!granted) {
          log("Access denied by user, executing without auth");
          // User denied access - still execute but without biometry
          try {
            const result = await onSuccess();
            triggerHaptic("success");
            setStatus("idle");
            return { success: true, status: "denied", result };
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            setError(errorMsg);
            setStatus("error");
            return { success: false, status: "error", error: errorMsg };
          }
        }
      }

      // Step 3: Authenticate
      setStatus("authenticating");
      log("Authenticating...");

      try {
        const authResult = await biometry.authenticate({ reason });
        log("Auth result", authResult);

        if (authResult.status === "authorized") {
          log("Authorized, executing callback");
          const result = await onSuccess();
          triggerHaptic("success");
          setStatus("authorized");
          setTimeout(() => setStatus("idle"), 1000);
          return { success: true, status: "authorized", result };
        } else {
          log("Authentication failed", authResult.status);
          triggerHaptic("error");
          setStatus("denied");
          setError("Authentication failed");
          showErrorPopup("Biometric authentication failed. Please try again.");
          return { success: false, status: "denied", error: "Authentication failed" };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        log("Auth error", err);
        setError(errorMsg);
        setStatus("error");
        triggerHaptic("error");
        showErrorPopup(`Authentication error: ${errorMsg}`);
        return { success: false, status: "error", error: errorMsg };
      }
    },
    [isAvailable, requestAccess, triggerHaptic, log, biometryEnabled]
  );

  /**
   * Simple wrapper that doesn't fall back on failure
   * Use when the action MUST be authenticated
   */
  const requireBiometricAuth = useCallback(
    async <T>(
      onSuccess: () => T | Promise<T>,
      reason: string
    ): Promise<BiometricResult & { result?: T }> => {
      setError(null);
      log("Starting REQUIRED biometric auth", { reason });

      // Check availability
      setStatus("checking");
      if (!isAvailable()) {
        log("Biometry not available");
        setStatus("unavailable");
        setError("Biometry not available on this device");
        showErrorPopup("Biometric authentication is not available on this device.");
        return {
          success: false,
          status: "unavailable",
          error: "Biometry not available on this device",
        };
      }

      // Ensure access
      const state = biometry.state();
      if (!state.accessGranted) {
        const granted = await requestAccess("This action requires biometrics");
        if (!granted) {
          setStatus("denied");
          setError("Biometry access denied");
          triggerHaptic("error");
          showErrorPopup("Biometric access was denied. Enable it in Settings.");
          return { success: false, status: "denied", error: "Biometry access denied" };
        }
      }

      // Authenticate
      setStatus("authenticating");
      try {
        const authResult = await biometry.authenticate({ reason });

        if (authResult.status === "authorized") {
          const result = await onSuccess();
          triggerHaptic("success");
          setStatus("authorized");
          setTimeout(() => setStatus("idle"), 1000);
          return { success: true, status: "authorized", result };
        } else {
          triggerHaptic("error");
          setStatus("denied");
          setError("Authentication denied");
          showErrorPopup("Biometric authentication was denied. Please try again.");
          return { success: false, status: "denied", error: "Authentication denied" };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        setStatus("error");
        triggerHaptic("error");
        showErrorPopup(`Authentication error: ${errorMsg}`);
        return { success: false, status: "error", error: errorMsg };
      }
    },
    [isAvailable, requestAccess, triggerHaptic, log]
  );

  return {
    /** Current status of biometric flow */
    status,
    /** Error message if any */
    error,
    /** Whether biometry is available */
    isAvailable,
    /** Get current biometry state */
    getState,
    /** Request biometry access (usually automatic) */
    requestAccess,
    /** Execute action with biometry, falls back on unavailable */
    withBiometricAuth,
    /** Execute action requiring biometry, fails if unavailable */
    requireBiometricAuth,
    /** Open biometry settings (must be called from user click) */
    openSettings,
    /** Whether openSettings is available */
    canOpenSettings: biometry.openSettings.isAvailable(),
    /** Whether currently in a biometric flow */
    isProcessing: ["checking", "requesting_access", "authenticating"].includes(status),
  };
}
