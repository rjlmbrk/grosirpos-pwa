"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { Toaster, toast } from "sonner";

interface InstallPromptContext {
  deferredPrompt: BeforeInstallPromptEvent | null;
  showInstall: boolean;
  isStandalone: boolean;
}

const InstallPromptCtx = createContext<InstallPromptContext>({
  deferredPrompt: null,
  showInstall: false,
  isStandalone: true,
});

export function useInstallPrompt() {
  return useContext(InstallPromptCtx);
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  const showOffline = useCallback(() => {
    toast.warning("Koneksi terputus", {
      description: "Kamu sedang offline",
      duration: 5000,
    });
  }, []);

  const showOnline = useCallback(() => {
    toast.success("Koneksi kembali", {
      description: "Kamu sudah online",
      duration: 3000,
    });
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      showOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showOffline();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showOffline, showOnline]);

  useEffect(() => {
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    const mq = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(mq.matches);
    const handleDisplayMode = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener("change", handleDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
      mq.removeEventListener("change", handleDisplayMode);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (sw) {
              sw.addEventListener("statechange", () => {
                if (sw.state === "installed" && navigator.serviceWorker.controller) {
                  toast.info("Pembaruan tersedia", {
                    description: "Muat ulang halaman untuk menggunakan versi terbaru",
                    duration: 8000,
                    action: {
                      label: "Muat Ulang",
                      onClick: () => window.location.reload(),
                    },
                  });
                }
              });
            }
          });
        })
        .catch(() => {
          // Service worker registration failed, offline features unavailable
        });
    }
  }, []);

  return (
    <InstallPromptCtx.Provider value={{ deferredPrompt, showInstall, isStandalone }}>
      {children}
      <Toaster position="top-center" richColors />
    </InstallPromptCtx.Provider>
  );
}
