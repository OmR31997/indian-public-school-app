import { PageLoader } from "@/components/ui/PageLoader";

export default function PublicLoading() {
  return (
    <main className="flex-1 min-h-[60vh] flex items-center justify-center bg-slate-50/70">
      <PageLoader message="Loading page details..." variant="full" />
    </main>
  );
}
