import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

type Insets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type TelegramLayoutApi = {
  requestFullscreen?: () => void;
  expand: () => void;
  lockOrientation?: () => void;
  safeAreaInset?: Insets;
  contentSafeAreaInset?: Insets;
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
};

const ZERO_INSETS: Required<Insets> = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const toPx = (value: number | undefined): string => `${value ?? 0}px`;

const resolveInsets = (insets: Insets | undefined): Required<Insets> => ({
  top: insets?.top ?? ZERO_INSETS.top,
  right: insets?.right ?? ZERO_INSETS.right,
  bottom: insets?.bottom ?? ZERO_INSETS.bottom,
  left: insets?.left ?? ZERO_INSETS.left,
});

const applyInsetVariables = (safeAreaInset: Insets | undefined, contentSafeAreaInset: Insets | undefined): void => {
  if (typeof document === "undefined") {
    return;
  }

  const safe = resolveInsets(safeAreaInset);
  const content = resolveInsets(contentSafeAreaInset);
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty("--tg-safe-top", toPx(safe.top));
  rootStyle.setProperty("--tg-safe-right", toPx(safe.right));
  rootStyle.setProperty("--tg-safe-bottom", toPx(safe.bottom));
  rootStyle.setProperty("--tg-safe-left", toPx(safe.left));

  rootStyle.setProperty("--tg-content-top", toPx(content.top));
  rootStyle.setProperty("--tg-content-right", toPx(content.right));
  rootStyle.setProperty("--tg-content-bottom", toPx(content.bottom));
  rootStyle.setProperty("--tg-content-left", toPx(content.left));
};

export const useTelegramLayout = (): void => {
  useEffect(() => {
    const tg = WebApp as unknown as TelegramLayoutApi;

    applyInsetVariables(tg.safeAreaInset, tg.contentSafeAreaInset);

    if (typeof tg.requestFullscreen === "function") {
      tg.requestFullscreen();
    } else {
      tg.expand();
    }

    if (typeof tg.lockOrientation === "function") {
      tg.lockOrientation();
    }

    let hasRetriedFullscreen = false;

    const handleSafeAreaChanged = (): void => {
      applyInsetVariables(tg.safeAreaInset, tg.contentSafeAreaInset);
    };

    const handleContentSafeAreaChanged = (): void => {
      applyInsetVariables(tg.safeAreaInset, tg.contentSafeAreaInset);
    };

    const handleFullscreenChanged = (): void => {
      if (hasRetriedFullscreen) {
        return;
      }

      hasRetriedFullscreen = true;

      if (typeof tg.requestFullscreen === "function") {
        tg.requestFullscreen();
        return;
      }

      tg.expand();
    };

    tg.onEvent?.("safeAreaChanged", handleSafeAreaChanged);
    tg.onEvent?.("contentSafeAreaChanged", handleContentSafeAreaChanged);
    tg.onEvent?.("fullscreenChanged", handleFullscreenChanged);

    return () => {
      tg.offEvent?.("safeAreaChanged", handleSafeAreaChanged);
      tg.offEvent?.("contentSafeAreaChanged", handleContentSafeAreaChanged);
      tg.offEvent?.("fullscreenChanged", handleFullscreenChanged);
    };
  }, []);
};
