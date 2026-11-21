import AppShell from "@/components/AppShell";
import AuthProvider from "@/components/AuthProvider";
import DriveProvider from "@/components/DriveProvider";

// Single page app. AuthProvider holds the Supabase sign-in state; DriveProvider holds the
// (in-memory) Google Drive connection; the shell shows the sign-in card until signed in.
export default function Home() {
  return (
    <AuthProvider>
      <DriveProvider>
        <AppShell />
      </DriveProvider>
    </AuthProvider>
  );
}
