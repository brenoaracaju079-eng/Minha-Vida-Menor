export const pad = (n: number) => String(n).padStart(2, "0");
export function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const todayStr = () => fmtDate(new Date());
export const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function addDays(s: string, n: number) {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
export function diffDays(a: string, b: string) {
  return Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
}
export const brDate = (s: string) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};
export const shortDate = (s: string) => {
  const [, m, d] = s.split("-");
  return `${d}/${m}`;
};
export const monthKey = (s: string) => s.slice(0, 7);
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
export function shiftMonth(key: string, n: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
export function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const weekdaysShort = ["D", "S", "T", "Q", "Q", "S", "S"];

export const bmi = (w: number, hCm: number) => (hCm > 0 ? w / Math.pow(hCm / 100, 2) : 0);
export function bmiClass(b: number) {
  if (!b) return "—";
  if (b < 18.5) return "Abaixo do peso";
  if (b < 25) return "Peso adequado";
  if (b < 30) return "Sobrepeso";
  if (b < 35) return "Obesidade grau I";
  if (b < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}
export const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
};
export const f1 = (n: number | undefined) => (n === undefined || isNaN(n) ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }));
export const f0 = (n: number) => Math.round(n).toLocaleString("pt-BR");

const LB = 2.20462;
export const wShow = (kg: number, unit: "kg" | "lb") => (unit === "lb" ? kg * LB : kg);
export const wStore = (v: number, unit: "kg" | "lb") => (unit === "lb" ? v / LB : v);
export const wFmt = (kg: number | undefined, unit: "kg" | "lb") =>
  kg === undefined ? "—" : `${f1(wShow(kg, unit))} ${unit}`;

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mvm-salt:" + text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function download(name: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
