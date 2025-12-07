"use client";

export default function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-2">Paused</h3>
        <div className="flex gap-2 justify-center">
          <button onClick={onResume} className="px-3 py-1 bg-slate-600 rounded">
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
