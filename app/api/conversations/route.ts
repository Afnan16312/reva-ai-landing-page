import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("reva_conversations")
    .select("*, patient:reva_patients(id,name,phone)")
    .eq("clinic_id", clinic.id)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
