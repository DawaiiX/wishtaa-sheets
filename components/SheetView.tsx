/** Sheet view: placeholder where the Google Sheet is embedded in a later phase. */
export default function SheetView() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="text-sm font-semibold">Sheet view</div>
        <p className="mt-2 text-sm text-slate-500">
          The Google Sheet attached to the selected node will be embedded here later.
        </p>
      </div>
    </div>
  );
}
