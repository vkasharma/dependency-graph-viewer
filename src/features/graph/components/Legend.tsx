function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-4 h-3 rounded-sm border ${className}`} />
      <span>{label}</span>
    </div>
  );
}

export function Legend() {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-600 shadow-sm space-y-1.5"
      role="note"
      aria-label="Graph legend"
    >
      <p className="font-semibold text-gray-700 text-xs mb-1">Legend</p>
      <Swatch
        className="border-red-500 bg-red-50"
        label="Activity (critical)"
      />
      <Swatch
        className="border-orange-400 bg-orange-50"
        label="Activity (high)"
      />
      <Swatch
        className="border-yellow-400 bg-yellow-50"
        label="Activity (medium)"
      />
      <Swatch
        className="border-gray-400 bg-gray-50"
        label="Activity (low)"
      />
      <Swatch className="border-blue-400 bg-blue-50" label="Resource" />
      <Swatch
        className="border-red-600 bg-red-50 ring-1 ring-red-300"
        label="SPOF resource"
      />
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-3 rounded-sm border border-gray-300 bg-gray-100 opacity-25" />
        <span>De-emphasized (unrelated to selection)</span>
      </div>
    </div>
  );
}
