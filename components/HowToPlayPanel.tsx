"use client";

type HowToPlayPanelProps = {
  onClose: () => void;
};

export default function HowToPlayPanel({ onClose }: HowToPlayPanelProps) {
  return (
    <div className="absolute h-full inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-[320px] text-white border border-slate-700">
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-3">
            How to Play
          </h3>

          {/* Desktop Controls */}
          <div className="mb-3">
            <h4 className="text-slate-400 font-medium text-xs uppercase mb-2">
              🖥️ Desktop Controls
            </h4>
            <div className="text-slate-300 text-sm space-y-2">
              <p>
                <kbd className="bg-slate-700 px-2 py-1 rounded">←</kbd>{" "}
                <kbd className="bg-slate-700 px-2 py-1 rounded">→</kbd>{" "}
                <kbd className="bg-slate-700 px-2 py-1 rounded">↑</kbd>{" "}
                <kbd className="bg-slate-700 px-2 py-1 rounded">↓</kbd> or{" "}
                <kbd className="bg-slate-700 px-2 py-1 rounded">WASD</kbd> Move
              </p>
              <p>
                <kbd className="bg-slate-700 px-2 py-1 rounded">Space</kbd>{" "}
                Shoot
              </p>
              <p>
                <kbd className="bg-slate-700 px-2 py-1 rounded">P</kbd> Pause
              </p>
              <p>
                <kbd className="bg-slate-700 px-2 py-1 rounded">S</kbd> Settings
              </p>
            </div>
          </div>

          {/* Mobile Controls */}
          <div>
            <h4 className="text-slate-400 font-medium text-xs uppercase mb-2">
              📱 Mobile Controls
            </h4>
            <div className="text-slate-300 text-sm space-y-2">
              <p>
                <span className="bg-slate-700 px-2 py-1 rounded">
                  Touch & Hold
                </span>{" "}
                Move in any direction
              </p>
              <p>
                <span className="bg-slate-700 px-2 py-1 rounded">Tap</span>{" "}
                Shoot
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-blue-600/80 hover:bg-blue-600 text-sm transition-colors font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
