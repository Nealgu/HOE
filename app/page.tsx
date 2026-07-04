import { Dashboard } from "@/components/dashboard";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { sampleProject } from "@/lib/sample-data";

export default function Home() {
  const { isConfigured } = getSupabaseConfig();

  return <Dashboard initialProject={sampleProject} cloudReady={isConfigured} />;
}
