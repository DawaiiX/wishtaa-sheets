/** Collapsible how-to: run a sheet's own Apps Script on a timer (all done inside Google). */
export default function TriggerHelp() {
  return (
    <details className="rounded-md border border-slate-200 bg-slate-50 text-sm">
      <summary className="cursor-pointer px-3 py-2 font-medium text-slate-700">
        Run this script on a timer
      </summary>
      <div className="space-y-2 px-3 pb-3 text-slate-600">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open the Google Sheet, then Extensions, then Apps Script.</li>
          <li>
            Paste the script and save. Run the function once by hand and approve the permission
            prompt Google shows.
          </li>
          <li>In the left sidebar, open Triggers (clock icon) and click &quot;Add Trigger&quot;.</li>
          <li>
            Choose the function to run. Event source: &quot;Time-driven&quot;. Type: &quot;Minutes
            timer&quot;. Interval: every 1, 5, 10, 15 or 30 minutes. Save.
          </li>
        </ol>
        <p>
          It runs inside Google under the account that created the trigger, and Google&apos;s daily
          quotas apply. This site cannot see it run.
        </p>
        <p>
          A single Apps Script run stops after about 6 minutes (30 minutes on some Google Workspace
          plans), so very heavy steps may need to be split.
        </p>
      </div>
    </details>
  );
}
