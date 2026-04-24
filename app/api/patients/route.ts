/**
 * /api/patients
 * GET  — list patients (?search=name)
 * POST — create patient
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("reva_patients")
    .select("*")
    .eq("clinic_id", clinic.id)
    .order("updated_at", { ascending: false });

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ patients: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  const { name, phone, age, gender, blood_group, allergies, conditions, notes } = body;

  if (!name || !phone) return NextResponse.json({ error: "name and phone required" }, { status: 400 });

  const { data, error } = await supabase
    .from("reva_patients")
    .upsert({ clinic_id: clinic.id, name, phone, age, gender, blood_group, allergies: allergies ?? [], conditions: conditions ?? [], notes }, { onConflict: "clinic_id,phone" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ patient: data }, { status: 201 });
}
