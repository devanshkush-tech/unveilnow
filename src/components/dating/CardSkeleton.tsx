export const ProfileCardSkeleton = () => (
  <div className="bg-card border border-border/60 rounded-3xl shadow-card overflow-hidden">
    <div className="h-32 skeleton-shimmer rounded-none" />
    <div className="p-5 space-y-4">
      <div className="flex gap-3">
        <div className="h-3 w-20 skeleton-shimmer" />
        <div className="h-3 w-24 skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-32 skeleton-shimmer" />
        <div className="h-5 w-full skeleton-shimmer" />
        <div className="h-5 w-4/5 skeleton-shimmer" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-10 flex-1 skeleton-shimmer rounded-full" />
        <div className="h-10 flex-1 skeleton-shimmer rounded-full" />
      </div>
    </div>
  </div>
);

export const ChatRowSkeleton = () => (
  <div className="flex items-center gap-3 p-4 border-b border-border/40">
    <div className="h-11 w-11 rounded-full skeleton-shimmer" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-24 skeleton-shimmer" />
      <div className="h-2.5 w-32 skeleton-shimmer" />
    </div>
  </div>
);
