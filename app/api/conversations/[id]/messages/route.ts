import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("reva_messages")
    .select("*")
    .eq("conversation_id", id)
    .eq("clinic_id", clinic.id)
    .order("sent_at", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}
