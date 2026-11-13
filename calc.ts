import { regionNames, type AppState, type Med, type Injection, type Region } from "./store";
import { addDays, diffDays, todayStr, monthKey, daysInMonth } from "./utils";

export const freqDays: Record<string, number> = { Diária: 1, Semanal: 7, Quinzenal: 14, Mensal: 30 };

export function weighings(s: AppState) {
  return s.measures.filter((m) => m.weight !== undefined).sort((a, b) => a.date.localeCompare(b.date));
}
export function currentWeight(s: AppState) {
  const w = weighings(s);
  return w.length ? (w[w.length - 1].weight as number) : s.profile?.startWeight ?? 0;
}
export function nextDose(med: Med, injections: Injection[]) {
  const mine = injections.filter((i) => i.medId === med.id).sort((a, b) => b.date.localeCompare(a.date));
  const date = mine.length ? addDays(mine[0].date, freqDays[med.frequency] || 7) : med.startDate;
  return { date, overdue: diffDays(date, todayStr()) < 0, days: diffDays(date, todayStr()) };
}
export function nextApplication(s: AppState) {
  const list = s.meds
    .filter((m) => !m.ended)
    .map((m) => ({ med: m, ...nextDose(m, s.injections) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return list[0];
}
export function waterOn(s: AppState, date: string) {
  return s.water.filter((w) => w.date === date).reduce((a, b) => a + b.ml, 0);
}

export function heatKey(region: Region, side: string) {
  return region === "abdomen" ? `abdomen:${side}` : region;
}
export function lastUse(s: AppState, key: string, sinceDays: number) {
  const limit = addDays(todayStr(), -sinceDays);
  const hits = s.injections
    .filter((i) => heatKey(i.region, i.side) === key && i.date >= limit)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { last: hits[0]?.date as string | undefined, count: hits.length };
}

export type Achievement = { id: string; icon: string; title: string; desc: string; done: boolean };
export function achievements(s: AppState, month?: string): Achievement[] {
  const inM = <T extends { date: string }>(l: T[]) => (month ? l.filter((x) => monthKey(x.date) === month) : l);
  const w = weighings(s);
  const lost = s.profile ? s.profile.startWeight - currentWeight(s) : 0;
  const waterDays = new Set(inM(s.water).map((x) => x.date));
  let goalDays = 0;
  waterDays.forEach((d) => { if (s.profile && waterOn(s, d) >= s.profile.waterGoalMl) goalDays++; });
  const activeDays = new Set(inM(s.activities).map((a) => a.date)).size;
  const regions = new Set(inM(s.injections).map((i) => heatKey(i.region, i.side)));
  return [
    { id: "a1", icon: "⚖️", title: "Primeira pesagem", desc: "Registrou seu peso", done: inM(w).length >= 1 },
    { id: "a2", icon: "💉", title: "Primeira aplicação", desc: "Registrou uma aplicação", done: inM(s.injections).length >= 1 },
    { id: "a3", icon: "📅", title: "Constância no tratamento", desc: "4 aplicações registradas", done: inM(s.injections).length >= 4 },
    { id: "a4", icon: "🔄", title: "Rodízio visualizado", desc: "4 ou mais locais diferentes registrados", done: regions.size >= 4 },
    { id: "a5", icon: "💧", title: "Meta de água", desc: "Bateu a meta de água em 7 dias", done: goalDays >= 7 },
    { id: "a6", icon: "🚶", title: "Em movimento", desc: "8 dias ativos", done: activeDays >= 8 },
    { id: "a7", icon: "📝", title: "Diário em dia", desc: "5 registros no diário", done: inM(s.diary).length >= 5 },
    { id: "a8", icon: "📏", title: "Medidas em dia", desc: "Registrou medidas corporais", done: inM(s.measures).some((m) => m.waist || m.abdomen || m.hip) },
    { id: "a9", icon: "⭐", title: "1 kg a menos", desc: "Primeiro quilo eliminado", done: !month && lost >= 1 },
    { id: "a10", icon: "🏅", title: "5 kg a menos", desc: "Cinco quilos eliminados", done: !month && lost >= 5 },
    { id: "a11", icon: "🏆", title: "10 kg a menos", desc: "Dez quilos eliminados", done: !month && lost >= 10 },
    { id: "a12", icon: "📸", title: "Foto de evolução", desc: "Registrou uma foto privada", done: inM(s.photos).length >= 1 },
  ];
}

export function monthStats(s: AppState, key: string) {
  const inM = <T extends { date: string }>(l: T[]) => l.filter((x) => monthKey(x.date) === key);
  const p = s.profile;
  const w = weighings(s);
  const wm = inM(w);
  const before = w.filter((x) => monthKey(x.date) < key);
  const startW = wm.length ? wm[0].weight : before.length ? before[before.length - 1].weight : undefined;
  const endW = wm.length ? wm[wm.length - 1].weight : undefined;
  const days = daysInMonth(key);
  const waterByDay: Record<string, number> = {};
  inM(s.water).forEach((x) => (waterByDay[x.date] = (waterByDay[x.date] || 0) + x.ml));
  const waterDays = Object.keys(waterByDay).length;
  const waterTotal = Object.values(waterByDay).reduce((a, b) => a + b, 0);
  const goalDays = Object.values(waterByDay).filter((v) => p && v >= p.waterGoalMl).length;
  const acts = inM(s.activities);
  const activeDays = new Set(acts.map((a) => a.date)).size;
  const injs = inM(s.injections);
  const sites: Record<string, number> = {};
  injs.forEach((i) => { const k = i.region === "abdomen" ? `Abdômen (${i.side.toLowerCase()})` : regionNames[i.region]; sites[k] = (sites[k] || 0) + 1; });
  const syms = inM(s.symptoms);
  const diaryDays = new Set(inM(s.diary).map((d) => d.date)).size;
  const regular = Math.round(
    ((waterDays / days) * 100 + (activeDays / days) * 100 * 2 + (Math.min(wm.length, 4) / 4) * 100) / 4,
  );
  return {
    key, startW, endW, diff: startW !== undefined && endW !== undefined ? endW - startW : undefined,
    measuresStart: wm.length ? undefined : undefined,
    injections: injs.length, sites, waterAvg: waterDays ? waterTotal / waterDays : 0, waterDays, goalDays,
    activeDays, minutes: acts.reduce((a, b) => a + b.minutes, 0), symptoms: syms, diaryDays,
    weighIns: wm.length, regular, days,
  };
}

export function measureChange(s: AppState, key: string, field: "waist" | "abdomen" | "hip" | "arm" | "thigh" | "bodyFat") {
  const all = s.measures.filter((m) => m[field] !== undefined).sort((a, b) => a.date.localeCompare(b.date));
  const inM = all.filter((m) => monthKey(m.date) === key);
  if (!inM.length) return undefined;
  const before = all.filter((m) => monthKey(m.date) < key);
  const a = inM[0][field] as number;
  const prev = before.length ? (before[before.length - 1][field] as number) : a;
  const b = inM[inM.length - 1][field] as number;
  return { start: prev, end: b };
}
