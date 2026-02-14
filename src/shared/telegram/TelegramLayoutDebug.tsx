import { useEffect, useState, type ReactElement } from "react";
import WebApp from "@twa-dev/sdk";

type Insets = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type TelegramDebugApi = {
  version?: string;
  platform?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: Insets;
  contentSafeAreaInset?: Insets;
};

type LayoutVars = {
  safeTop: string;
  contentTop: string;
  layoutTop: string;
  layoutTopReserve: string;
  layoutEffectiveTop: string;
};

const readLayoutVars = (): LayoutVars => {
  if (typeof window === "undefined") {
    return {
      safeTop: "0px",
      contentTop: "0px",
      layoutTop: "0px",
      layoutTopReserve: "0px",
      layoutEffectiveTop: "0px",
    };
  }

  const rootStyles = window.getComputedStyle(document.documentElement);

  return {
    safeTop: rootStyles.getPropertyValue("--tg-safe-top").trim() || "0px",
    contentTop: rootStyles.getPropertyValue("--tg-content-top").trim() || "0px",
    layoutTop: rootStyles.getPropertyValue("--tg-layout-top").trim() || "0px",
    layoutTopReserve: rootStyles.getPropertyValue("--tg-layout-top-reserve").trim() || "0px",
    layoutEffectiveTop: rootStyles.getPropertyValue("--tg-layout-effective-top").trim() || "0px",
  };
};

const hasDebugFlag = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("tgLayoutDebug") === "1";
};

export const TelegramLayoutDebug = (): ReactElement | null => {
  const isDev = import.meta.env.DEV;
  const [isOpen, setIsOpen] = useState<boolean>(() => isDev && hasDebugFlag());
  const [layoutVars, setLayoutVars] = useState<LayoutVars>(() => readLayoutVars());
  const tg = WebApp as unknown as TelegramDebugApi;

  useEffect(() => {
    if (!isDev || !isOpen) {
      return;
    }

    const sync = (): void => {
      setLayoutVars(readLayoutVars());
    };

    sync();
    const intervalId = window.setInterval(sync, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isDev, isOpen]);

  if (!isDev) {
    return null;
  }

  const toggleDebug = (): void => {
    setIsOpen((previousState: boolean) => !previousState);
  };

  return (
    <>
      <button type="button" className="tg-layout-debug-toggle" onClick={toggleDebug}>
        {isOpen ? "Скрыть debug" : "Показать debug"}
      </button>
      {isOpen ? (
        <div className="tg-layout-debug" role="status" aria-live="polite">
          <p>debug: on</p>
          <p>version: {tg.version ?? "n/a"}</p>
          <p>platform: {tg.platform ?? "n/a"}</p>
          <p>isExpanded: {String(tg.isExpanded ?? false)}</p>
          <p>viewport: {tg.viewportHeight ?? 0} / stable: {tg.viewportStableHeight ?? 0}</p>
          <p>
            safeTop/contentTop/layoutTop: {layoutVars.safeTop} / {layoutVars.contentTop} / {layoutVars.layoutTop}
          </p>
          <p>topReserve/effectiveTop: {layoutVars.layoutTopReserve} / {layoutVars.layoutEffectiveTop}</p>
          <p>safeInset: {JSON.stringify(tg.safeAreaInset ?? {})}</p>
          <p>contentInset: {JSON.stringify(tg.contentSafeAreaInset ?? {})}</p>
        </div>
      ) : null}
    </>
  );
};
