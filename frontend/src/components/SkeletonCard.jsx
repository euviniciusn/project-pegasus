export default function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3 border border-neutral-200 bg-white">
      <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-4 w-2/3 skeleton" />
        <div className="h-3 w-1/3 skeleton" />
      </div>
    </div>
  );
}
