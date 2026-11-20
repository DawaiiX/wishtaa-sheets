import AppShell from "@/components/AppShell";
import AuthProvider from "@/components/AuthProvider";

// Single page app. AuthProvider holds the Supabase sign-in state; the shell shows the sign-in
// card until the user is signed in, then the header tabs and the map.
export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
