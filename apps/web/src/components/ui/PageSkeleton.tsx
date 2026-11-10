export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6" aria-busy="true">
      <div className="skeleton h-10 w-72 max-w-full" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="skeleton h-80 lg:col-span-2" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}
