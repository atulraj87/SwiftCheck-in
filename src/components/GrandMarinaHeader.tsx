type GrandMarinaHeaderProps = {
  /** e.g. "checkin@grandmarina.com" */
  fromEmail?: string;
};

export function GrandMarinaHeader({ fromEmail = "checkin@grandmarina.com" }: GrandMarinaHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-zinc-200 pb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
        G
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-600">Grand Marina Hotel</p>
        <p className="text-xs text-zinc-500">{fromEmail}</p>
      </div>
    </div>
  );
}


