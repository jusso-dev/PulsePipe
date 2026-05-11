import { Activity } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { Panel } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Panel className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-ink text-paper">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">PulsePipe</h1>
            <p className="text-sm text-muted">Event ingestion control plane</p>
          </div>
        </div>
        <LoginForm />
      </Panel>
    </main>
  );
}
