"use client";

import { format, startOfDay, subDays, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";

export function DateFilterPresets() {
  function applyPreset(days: number) {
    const fromInput = document.querySelector<HTMLInputElement>(
      "input[name='fromDate']",
    );
    const toInput = document.querySelector<HTMLInputElement>(
      "input[name='toDate']",
    );
    if (!fromInput || !toInput) return;

    const today = new Date();

    if (days === 0) {
      fromInput.value = format(startOfMonth(today), "yyyy-MM-dd");
    } else {
      fromInput.value = format(startOfDay(subDays(today, days - 1)), "yyyy-MM-dd");
    }
    toInput.value = format(today, "yyyy-MM-dd");

    fromInput.form?.requestSubmit();
  }

  return (
    <div className="flex gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => applyPreset(1)}
      >
        Hari Ini
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => applyPreset(7)}
      >
        7 Hari
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => applyPreset(30)}
      >
        1 Bulan
      </Button>
    </div>
  );
}
