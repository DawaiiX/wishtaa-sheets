import { LIMITS } from "@/lib/limits";

/** Instructions tab: plain-text notes for whoever maintains this sheet. */
export default function InstructionsTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor="node-instructions" className="text-sm font-medium text-slate-700">
        Instructions
      </label>
      <textarea
        id="node-instructions"
        value={value}
        maxLength={LIMITS.instructions}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder="What this sheet does, where its input comes from, what to check..."
        className="w-full resize-y rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="text-right text-xs text-slate-400">
        {value.length.toLocaleString()} / {LIMITS.instructions.toLocaleString()}
      </div>
    </div>
  );
}
