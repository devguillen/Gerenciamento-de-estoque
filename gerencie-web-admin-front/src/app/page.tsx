import { Loader2 } from "lucide-react";

export default function Home() {
  // The middleware will redirect the user, so we can just show a loading state.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
