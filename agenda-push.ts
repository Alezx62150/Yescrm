// YES CRM – fonction « agenda-push » : envoie les rappels de rendez-vous (notifications)
// À coller dans Supabase > Edge Functions > agenda-push (voir le guide).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

/* ---------- logique pure (heure de Paris, calcul des rappels) ---------- */
function parisToUtc(d, h) {
  const [y, m, dd] = d.split("-").map(Number), [hh, mi] = (h || "00:00").split(":").map(Number);
  let guess = Date.UTC(y, m - 1, dd, hh, mi || 0);
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(fmt.formatToParts(new Date(guess)).map((x) => [x.type, x.value]));
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    guess -= asUtc - Date.UTC(y, m - 1, dd, hh, mi || 0);
  }
  return guess;
}
function collect(S) {
  const L = [];
  (S.ev || []).forEach((e) => { if (e && e.d && !e.ok) L.push({ id: "e" + e.id, d: e.d, h: e.h || "", t: e.t || "Rendez-vous", w: e.lieu || "" }); });
  (S.f || []).filter((f) => !f.arch).forEach((f) => {
    (f.ag || []).forEach((e) => { if (e.d && !e.ok) L.push({ id: "a" + e.id, d: e.d, h: "", t: e.t || "Échéance", w: f.name || "" }); });
    (f.bid ? [] : (f.vis || [])).forEach((v) => { if (v.d) L.push({ id: "v" + v.id, d: v.d, h: v.h || "", t: "Visite", w: f.name || "" }); });
  });
  (S.b || []).filter((b) => !b.arch).forEach((b) => { (b.vis || []).forEach((v) => { if (v.d) L.push({ id: "v" + v.id, d: v.d, h: v.h || "", t: "Visite", w: b.adr || b.ref || "" }); }); });
  return L;
}
function remindAt(ev, remMin) {
  return ev.h ? parisToUtc(ev.d, ev.h) - remMin * 60000 : parisToUtc(ev.d, "08:00");
}
function label(min) { return min >= 1440 ? "demain" : min >= 60 ? "dans " + (min / 60) + " h" : "dans " + min + " min"; }
function message(ev, remMin) {
  const when = ev.h ? "à " + ev.h : "aujourd’hui";
  return { title: "⏰ " + ev.t + (ev.h ? " " + label(remMin) : ""), body: (ev.h ? ev.h + " · " : "") + (ev.w || "Rendez-vous YES CRM"), url: "/?app=agenda", tag: ev.id };
}
export { parisToUtc, collect, remindAt, message };

/* ---------- serveur ---------- */
if (typeof Deno !== "undefined" && Deno.serve) {
  const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  webpush.setVapidDetails("https://crm.yes-immobilier.com", Deno.env.get("VAPID_PUBLIC_KEY"), Deno.env.get("VAPID_PRIVATE_KEY"));
  Deno.serve(async (req) => {
    if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return new Response("non autorisé", { status: 401 });
    const now = Date.now(); let sent = 0;
    const { data: subs } = await sb.from("crm_push").select("*");
    if (!subs || !subs.length) return new Response("0");
    const users = [...new Set(subs.map((s) => s.user_id))];
    const { data: rows } = await sb.from("crm_data").select("user_id,data").in("user_id", users);
    const ev = {}; (rows || []).forEach((r) => { try { ev[r.user_id] = collect(r.data || {}); } catch (_) { ev[r.user_id] = []; } });
    for (const s of subs) {
      for (const e of ev[s.user_id] || []) {
        const at = remindAt(e, s.rem_min || 30);
        if (at > now + 30000 || at < now - 5 * 60000) continue;
        const key = [s.id, e.id, e.d, e.h, s.rem_min].join("|");
        const { data: dup } = await sb.from("crm_push_sent").select("key").eq("key", key).maybeSingle();
        if (dup) continue;
        await sb.from("crm_push_sent").insert({ key });
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(message(e, s.rem_min || 30)));
          sent++;
        } catch (err) {
          if (err && (err.statusCode === 404 || err.statusCode === 410)) await sb.from("crm_push").delete().eq("id", s.id);
        }
      }
    }
    await sb.from("crm_push_sent").delete().lt("sent_at", new Date(now - 3 * 864e5).toISOString());
    return new Response(String(sent));
  });
}
