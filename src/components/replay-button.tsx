"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";

export function ReplayButton({ body, label }: { body: Record<string, string>; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/deliveries/replay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body)
        });
        setPending(false);
        router.refresh();
      }}
    >
      <RotateCcw size={15} />
      {pending ? "Queued" : label}
    </Button>
  );
}
