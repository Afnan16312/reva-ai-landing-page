/**
 * Client-side API helpers — typed fetch wrappers for all Reva API routes.
 * Use these in "use client" components / hooks.
 */

import type {
  RevaAppointment, RevaPatient, RevaConversation,
  RevaMessage, RevaInvoice, RevaFollowUp, RevaClinic
} from "@/lib/supabase/types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? res.statusText);
  }
  return res.json();
}

/* ── Clinic ─────────────────────────────────────────────────── */
export const getClinic = () =>
  apiFetch<{ clinic: RevaClinic }>("/api/clinic").then(r => r.clinic);

export const updateClinic = (data: Partial<RevaClinic>) =>
  apiFetch<{ clinic: RevaClinic }>("/api/clinic", { method: "PATCH", body: JSON.stringify(data) }).then(r => r.clinic);

/* ── Appointments ─────────────────────────────────────────────── */
export const getAppointments = (params?: { date?: string; status?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ appointments: RevaAppointment[] }>(`/api/appointments${qs ? `?${qs}` : ""}`).then(r => r.appointments);
};

export const createAppointment = (data: {
  patient_id?: string; doctor_id?: string;
  appointment_date: string; appointment_time: string;
  type?: string; notes?: string;
}) => apiFetch<{ appointment: RevaAppointment }>("/api/appointments", { method: "POST", body: JSON.stringify(data) }).then(r => r.appointment);

export const updateAppointment = (id: string, data: {
  status?: string; notes?: string;
  appointment_date?: string; appointment_time?: string;
}) => apiFetch<{ appointment: RevaAppointment }>(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.appointment);

/* ── Patients ─────────────────────────────────────────────────── */
export const getPatients = (search?: string) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<{ patients: RevaPatient[] }>(`/api/patients${qs}`).then(r => r.patients);
};

export const createPatient = (data: Partial<RevaPatient>) =>
  apiFetch<{ patient: RevaPatient }>("/api/patients", { method: "POST", body: JSON.stringify(data) }).then(r => r.patient);

/* ── Conversations ─────────────────────────────────────────────── */
export const getConversations = () =>
  apiFetch<{ conversations: RevaConversation[] }>("/api/conversations").then(r => r.conversations);

export const getMessages = (conversationId: string) =>
  apiFetch<{ messages: RevaMessage[] }>(`/api/conversations/${conversationId}/messages`).then(r => r.messages);

export const sendMessage = (conversationId: string, text: string) =>
  apiFetch<{ message: RevaMessage }>("/api/whatsapp/send", { method: "POST", body: JSON.stringify({ conversation_id: conversationId, text }) }).then(r => r.message);

export const markConversationRead = (conversationId: string) =>
  apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}/read`, { method: "POST" });

/* ── Invoices ─────────────────────────────────────────────────── */
export const getInvoices = (params?: { status?: string; period?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ invoices: RevaInvoice[] }>(`/api/invoices${qs ? `?${qs}` : ""}`).then(r => r.invoices);
};

export const updateInvoice = (id: string, data: { status?: string; payment_method?: string; waived_reason?: string; amount?: number }) =>
  apiFetch<{ invoice: RevaInvoice }>(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.invoice);

export const createInvoice = (data: Partial<RevaInvoice>) =>
  apiFetch<{ invoice: RevaInvoice }>("/api/invoices", { method: "POST", body: JSON.stringify(data) }).then(r => r.invoice);

/* ── Follow-ups ─────────────────────────────────────────────────── */
export const getFollowUps = () =>
  apiFetch<{ follow_ups: RevaFollowUp[] }>("/api/follow-ups").then(r => r.follow_ups);

export const updateFollowUp = (id: string, data: { status: string }) =>
  apiFetch<{ follow_up: RevaFollowUp }>(`/api/follow-ups/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.follow_up);
