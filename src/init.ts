import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  miniApp,
  backButton,
  locationManager,
  biometry,
} from "@tma.js/sdk-react";

/**
 * Initializes the Telegram Mini App SDK.
 */
export async function init(debug: boolean): Promise<void> {
  setDebug(debug);
  initSDK();

  backButton.mount.ifAvailable();
  initData.restore();
  locationManager.mount.ifAvailable();

  biometry.mount.ifAvailable();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }
}
