"use client";
import type { AppState } from "./store";
import { nextDose, waterOn } from "./calc";
import { todayStr, addDays, pad } from "./utils";

export async function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const opts: NotificationOptions = { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: title + body };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return void (await reg.showNotification(title, opts));
  } catch { /* usa fallback */ }
  new Notification(title, opts);
}

export async function askPermission() {
  if (typeof Notification === "undefined") return false;
  const r = await Notification.requestPermission();
  return r === "granted";
}

const FIRED = "mvm:fired";
function firedSet(): Record<string, true> {
  try { return JSON.parse(localStorage.getItem(FIRED) || "{}"); } catch { return {}; }
}

/** Verifica lembretes devidos neste minuto. Chamado periodicamente enquanto o app está aberto/em segundo plano. */
export function checkReminders(s: AppState) {
  if (!s.profile || !s.notif.enabled) return;
  const n = s.notif;
  const now = new Date();
  const today = todayStr();
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const fired = firedSet();
  const fire = (key: string, title: string, body: string) => {
    if (fired[key]) return;
    fired[key] = true;
    notify(title, body);
  };
  if (n.injection) {
    s.meds.filter((m) => !m.ended).forEach((m) => {
      const nd = nextDose(m, s.injections);
      if (nd.date <= today && hm >= m.time) fire(`inj:${m.id}:${today}`, "💉 Hora da aplicação", `Hoje é o dia programado de ${m.name}${m.dose ? ` (${m.dose})` : ""}. Registre após aplicar.`);
      if (nd.date === addDays(today, 1) && hm >= "18:00") fire(`injpre:${m.id}:${today}`, "💉 Aplicação amanhã", `Amanhã está prevista a aplicação de ${m.name}.`);
    });
  }
  if (n.water && now.getHours() >= 8 && now.getHours() <= 21 && (now.getHours() - 8) % Math.max(1, n.waterEveryH) === 0 && now.getMinutes() < 5) {
    if (waterOn(s, today) < s.profile.waterGoalMl) fire(`water:${today}:${now.getHours()}`, "💧 Hora de beber água", `Você já bebeu ${waterOn(s, today)} mL de ${s.profile.waterGoalMl} mL hoje.`);
  }
  if (n.weigh && now.getDay() === n.weighDay && hm >= n.weighTime) {
    if (!s.measures.some((m) => m.date === today && m.weight !== undefined)) fire(`weigh:${today}`, "⚖️ Dia de pesagem", "Registre seu peso de hoje no Minha Vida Menor.");
  }
  if (n.measures && now.getDate() === 1 && hm >= "09:00") fire(`meas:${today}`, "📏 Medidas do mês", "Que tal registrar suas medidas corporais e ver seu relatório do mês?");
  if (n.activity && hm >= n.activityTime && !s.activities.some((a) => a.date === today)) fire(`act:${today}`, "🏃 Hora de se movimentar", "Uma atividade leve já conta. Registre no app depois!");
  if (n.events) {
    s.events.forEach((e) => {
      if (e.date === today && hm >= (e.time || "08:00")) fire(`ev:${e.id}:${today}`, `${e.kind === "Exame" ? "🧪" : "🩺"} ${e.kind} hoje`, `${e.title}${e.time ? ` às ${e.time}` : ""}`);
      if (e.date === addDays(today, 1) && hm >= "18:00") fire(`evpre:${e.id}:${today}`, `${e.kind} amanhã`, e.title);
    });
  }
  try {
    const keys = Object.keys(fired);
    const trimmed = keys.length > 300 ? Object.fromEntries(keys.slice(-150).map((k) => [k, true])) : fired;
    localStorage.setItem(FIRED, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}
