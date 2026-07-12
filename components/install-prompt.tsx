"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/components/pwa-provider";
import { toast } from "sonner";

export function InstallPrompt() {
  const { deferredPrompt, isStandalone } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);

  if (isStandalone) return null;

  async function handleInstall() {
    if (!deferredPrompt) {
      toast.info("Install Aplikasi", {
        description:
          "Buka menu Chrome (⋮) → Install Aplikasi atau Add to Home Screen",
        duration: 5000,
      });
      return;
    }

    setInstalling(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
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
