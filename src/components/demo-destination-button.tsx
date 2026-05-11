"use client";

import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";

export function DemoDestinationButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">Need a delivery target for the demo?</p>
        <p className="mt-1 text-sm text-muted">Create a local webhook sink that returns 200 and records successful delivery attempts.</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            const response = await fetch("/api/destinations/demo", { method: "POST" });
            if (!response.ok) {
              setError("Demo destination could not be created.");
            }
            setPending(false);
            router.refresh();
          }}
        >
          <FlaskConical size={16} />
          {pending ? "Creating" : "Create demo sink"}
        </Button>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
