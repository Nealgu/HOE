"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ProjectSnapshot } from "@/types/domain";

export type SaveSnapshotResult = {
  ok: boolean;
  message: string;
};

export async function saveProjectSnapshot(snapshot: ProjectSnapshot): Promise<SaveSnapshotResult> {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return {
      ok: false,
      message: "Supabase environment variables are not configured yet."
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      message: "Sign in before syncing this project snapshot."
    };
  }

  const { error } = await supabase.from("project_snapshots").insert({
    owner_id: user.id,
    so_number: snapshot.salesOrder.soNumber,
    customer_name: snapshot.salesOrder.customerName,
    payload: snapshot
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  revalidatePath("/");

  return {
    ok: true,
    message: "Project snapshot synced to Supabase."
  };
}
