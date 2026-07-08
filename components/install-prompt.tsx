"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/components/pwa-provider";

export function InstallPrompt() {
  const { deferredPrompt, showInstall } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);

  if (!showInstall || !deferredPrompt) return null;

  const prompt = deferredPrompt;

  async function handleInstall() {
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalling(false);
    }
    setInstalling(false);
  }

  return (
    <Button
      variant="outline"
      className="gap-2 w-full"
      onClick={handleInstall}
      disabled={installing}
    >
      <Download className="h-4 w-4" />
      {installing ? "Menginstall..." : "Install Aplikasi"}
    </Button>
  );
}
