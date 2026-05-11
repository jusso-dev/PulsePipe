"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";

export function RevokeApiKeyButton({ apiKeyId }: { apiKeyId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch(`/api/api-keys?id=${encodeURIComponent(apiKeyId)}`, { method: "DELETE" });
        setPending(false);
        router.refresh();
      }}
    >
      <Ban size={15} />
      {pending ? "Revoking" : "Revoke"}
    </Button>
  );
}
