import { PageLoader } from "@/components/ui/PageLoader";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <PageLoader message="Loading Indian Public School..." variant="full" />
    </div>
  );
}
