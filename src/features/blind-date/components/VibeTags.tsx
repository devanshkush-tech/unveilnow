export function VibeTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {tags.map((t) => (
        <span
          key={t}
          className="shrink-0 rounded-full px-3 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F8FAFC" }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
