"use client";

import { Activity, BarChart3, BellDot, CircleGauge, KeyRound, Settings, Unplug, Webhook } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "./ui";

const nav = [
  { href: "/dashboard", label: "Overview", icon: CircleGauge },
  { href: "/dashboard/events", label: "Events", icon: Activity },
  { href: "/dashboard/destinations", label: "Destinations", icon: Webhook },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/failed", label: "Failed deliveries", icon: BellDot },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardNav({ workspaceName, userEmail }: { workspaceName: string; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="border-b border-line bg-paper px-4 py-4 lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-md bg-ink text-paper">
          <Unplug size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">PulsePipe</p>
          <p className="truncate text-xs text-muted">{workspaceName}</p>
        </div>
      </div>
      <nav className="mt-7 grid gap-1" aria-label="Dashboard">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "focus-ring flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-accent/10 text-ink" : "text-muted hover:bg-panel hover:text-ink"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} className={active ? "text-accent" : undefined} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 border-t border-line px-2 pt-4 text-xs text-muted">
        <p className="truncate font-medium text-ink">{userEmail}</p>
        <Button
          className="mt-3 w-full"
          type="button"
          variant="secondary"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
