import { EducationPageSkeleton } from "@/components/ui/PageLoader";

export default function DynamicPageLoading() {
  return (
    <main className="flex-1 min-h-[70vh] flex flex-col">
      <EducationPageSkeleton />
    </main>
  );
}
