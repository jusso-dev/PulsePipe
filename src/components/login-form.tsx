"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            password: form.get("password")
          })
        });
        if (!response.ok) {
          setError("Credentials did not match.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }}
    >
      <label className="block text-sm font-medium">
        Email
        <Input className="mt-1" name="email" type="email" defaultValue="owner@pulsepipe.dev" required />
      </label>
      <label className="block text-sm font-medium">
        Password
        <Input className="mt-1" name="password" type="password" defaultValue="pulsepipe" required />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button className="w-full" type="submit">
        Sign in
      </Button>
    </form>
  );
}
