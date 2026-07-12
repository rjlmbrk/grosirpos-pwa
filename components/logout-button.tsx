"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LogoutButton({ variant }: { variant?: "sidebar" | "mobile" }) {
  const [open, setOpen] = useState(false);

  if (variant === "mobile") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-zinc-500 whitespace-nowrap transition-colors hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
        <LogoutDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
      >
        <LogOut className="h-5 w-5" />
        Keluar
      </button>
      <LogoutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Konfirmasi Keluar</DialogTitle>
          <DialogDescription>
            Apakah kamu yakin ingin keluar dari akun?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <form action={logout} onSubmit={() => onOpenChange(false)}>
            <Button type="submit" variant="destructive">
              Keluar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
