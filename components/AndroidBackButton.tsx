"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function AndroidBackButton() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") {
      return;
    }

    let active = true;
    let removeListener: (() => void) | undefined;

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) {
        window.history.back();
        return;
      }

      App.exitApp();
    }).then((listener) => {
      if (!active) {
        listener.remove();
        return;
      }

      removeListener = () => listener.remove();
    });

    return () => {
      active = false;
      removeListener?.();
    };
  }, []);

  return null;
}
