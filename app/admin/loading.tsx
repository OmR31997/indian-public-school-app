import { PageLoader } from "@/components/ui/PageLoader";

export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <PageLoader message="Loading Admin Portal..." variant="full" className="bg-slate-900 text-white" />
    </div>
  );
}
