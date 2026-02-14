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
  platform?: string;
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
};

const IOS_TOP_RESERVE_PX = 12;

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

const resolveTopReserve = (platform: string | undefined): number => {
  if (platform === "ios") {
    return IOS_TOP_RESERVE_PX;
  }

  return 0;
};

const applyInsetVariables = (
  safeAreaInset: Insets | undefined,
  contentSafeAreaInset: Insets | undefined,
  platform: string | undefined,
): void => {
  if (typeof document === "undefined") {
    return;
  }

  const safe = resolveInsets(safeAreaInset);
  const content = resolveInsets(contentSafeAreaInset);
  const layout = {
    top: Math.max(safe.top, content.top),
    right: Math.max(safe.right, content.right),
    bottom: Math.max(safe.bottom, content.bottom),
    left: Math.max(safe.left, content.left),
  };
  const topReserve = resolveTopReserve(platform);
  const effectiveTop = layout.top + topReserve;
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty("--tg-safe-top", toPx(safe.top));
  rootStyle.setProperty("--tg-safe-right", toPx(safe.right));
  rootStyle.setProperty("--tg-safe-bottom", toPx(safe.bottom));
  rootStyle.setProperty("--tg-safe-left", toPx(safe.left));

  rootStyle.setProperty("--tg-content-top", toPx(content.top));
  rootStyle.setProperty("--tg-content-right", toPx(content.right));
  rootStyle.setProperty("--tg-content-bottom", toPx(content.bottom));
  rootStyle.setProperty("--tg-content-left", toPx(content.left));

  rootStyle.setProperty("--tg-layout-top", toPx(layout.top));
  rootStyle.setProperty("--tg-layout-right", toPx(layout.right));
  rootStyle.setProperty("--tg-layout-bottom", toPx(layout.bottom));
  rootStyle.setProperty("--tg-layout-left", toPx(layout.left));

  rootStyle.setProperty("--tg-layout-top-reserve", toPx(topReserve));
  rootStyle.setProperty("--tg-layout-effective-top", toPx(effectiveTop));
};

export const useTelegramLayout = (): void => {
  useEffect(() => {
    const tg = WebApp as unknown as TelegramLayoutApi;

    applyInsetVariables(tg.safeAreaInset, tg.contentSafeAreaInset, tg.platform);

    if (typeof tg.requestFullscreen === "function") {
      tg.requestFullscreen();
    } else {
      tg.expand();
    }

    if (typeof tg.lockOrientation === "function") {
      tg.lockOrientation();
    }

    let hasRetriedFullscreen = false;

    const syncLayoutVariables = (): void => {
      applyInsetVariables(tg.safeAreaInset, tg.contentSafeAreaInset, tg.platform);
    };

    const handleFullscreenChanged = (): void => {
      syncLayoutVariables();

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

    tg.onEvent?.("safeAreaChanged", syncLayoutVariables);
    tg.onEvent?.("contentSafeAreaChanged", syncLayoutVariables);
    tg.onEvent?.("fullscreenChanged", handleFullscreenChanged);

    return () => {
      tg.offEvent?.("safeAreaChanged", syncLayoutVariables);
      tg.offEvent?.("contentSafeAreaChanged", syncLayoutVariables);
      tg.offEvent?.("fullscreenChanged", handleFullscreenChanged);
    };
  }, []);
};
