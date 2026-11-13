"use client";
import { useSyncExternalStore } from "react";
import { uid } from "./utils";

export type Region = "abdomen" | "coxa_d" | "coxa_e" | "braco_d" | "braco_e";
export const regionNames: Record<Region, string> = {
  abdomen: "Abdômen",
  coxa_d: "Coxa direita",
  coxa_e: "Coxa esquerda",
  braco_d: "Braço direito",
  braco_e: "Braço esquerdo",
};

export type Profile = {
  name: string;
  sex: "F" | "M" | "O";
  birth: string;
  heightCm: number;
  startWeight: number;
  goalWeight: number;
  startDate: string;
  weightUnit: "kg" | "lb";
  theme: "claro" | "escuro" | "auto";
  waterGoalMl: number;
  cupMl: number;
  pinHash?: string;
  bioCredId?: string;
};
export type Frequency = "Diária" | "Semanal" | "Quinzenal" | "Mensal";
export type Med = {
  id: string; name: string; brand: string; active: string; concentration: string; dose: string;
  startDate: string; frequency: Frequency; weekday: number; time: string; notes: string; ended?: boolean;
};
export type Injection = {
  id: string; date: string; time: string; medId: string; dose: string; region: Region; side: string;
  area: string; notes: string; reactions: string[];
};
export type Measure = {
  id: string; date: string; weight?: number; waist?: number; abdomen?: number; hip?: number;
  arm?: number; thigh?: number; bodyFat?: number; height?: number;
};
export type Photo = { id: string; date: string; data: string; note: string };
export type WaterLog = { id: string; date: string; time: string; ml: number };
export type Activity = { id: string; date: string; type: string; minutes: number; intensity: string; distanceKm?: number; notes: string };
export type Symptom = { id: string; date: string; type: string; intensity: number; duration: string; notes: string };
export type DiaryEntry = { id: string; date: string; mood: string; text: string };
export type CalEvent = { id: string; date: string; time?: string; kind: string; title: string; notes: string };
export type ShopItem = { id: string; name: string; done: boolean };
export type Notif = {
  enabled: boolean; injection: boolean; water: boolean; waterEveryH: number; weigh: boolean;
  weighDay: number; weighTime: string; activity: boolean; activityTime: string; events: boolean; measures: boolean;
};

export type AppState = {
  loaded: boolean;
  profile: Profile | null;
  meds: Med[]; injections: Injection[]; measures: Measure[]; photos: Photo[]; water: WaterLog[];
  activities: Activity[]; symptoms: Symptom[]; diary: DiaryEntry[]; events: CalEvent[]; shopping: ShopItem[];
  favorites: string[];
  notif: Notif;
};
export type ListKey = "meds" | "injections" | "measures" | "photos" | "water" | "activities" | "symptoms" | "diary" | "events" | "shopping";

const initial: AppState = {
  loaded: false, profile: null,
  meds: [], injections: [], measures: [], photos: [], water: [], activities: [], symptoms: [], diary: [],
  events: [], shopping: [], favorites: [],
  notif: {
    enabled: false, injection: true, water: true, waterEveryH: 2, weigh: true, weighDay: 1, weighTime: "07:30",
    activity: false, activityTime: "18:00", events: true, measures: true,
  },
};

const KEY = "mvm:v1";
let state: AppState = initial;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useApp() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state,
    () => initial,
  );
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : {};
    state = { ...initial, ...data, notif: { ...initial.notif, ...(data.notif || {}) }, loaded: true };
  } catch {
    state = { ...initial, loaded: true };
  }
  emit();
}

function persist() {
  try {
    const { loaded, ...rest } = state;
    void loaded;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    alert("Não foi possível salvar: o armazenamento do aparelho está cheio. Exclua fotos antigas ou faça um backup.");
  }
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  persist();
  emit();
}
export const getState = () => state;

export function upsert<T extends object>(key: ListKey, item: T) {
  const withId = { ...item, id: (item as { id?: string }).id || uid() };
  setState((s) => {
    const list = s[key] as unknown as { id: string }[];
    const exists = list.some((x) => x.id === withId.id);
    const next = exists ? list.map((x) => (x.id === withId.id ? (withId as { id: string }) : x)) : [...list, withId as { id: string }];
    return { ...s, [key]: next } as AppState;
  });
}
export function remove(key: ListKey, id: string) {
  setState((s) => ({ ...s, [key]: (s[key] as unknown as { id: string }[]).filter((x) => x.id !== id) }) as AppState);
}
export function patchProfile(p: Partial<Profile>) {
  setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...p } } : s));
}
export function patchNotif(n: Partial<Notif>) {
  setState((s) => ({ ...s, notif: { ...s.notif, ...n } }));
}
export function toggleFav(id: string) {
  setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] }));
}
export function exportJson() {
  const { loaded, ...rest } = state;
  void loaded;
  return JSON.stringify({ app: "Minha Vida Menor", version: 1, exportedAt: new Date().toISOString(), data: rest }, null, 2);
}
export function importJson(text: string) {
  const j = JSON.parse(text);
  if (j.app !== "Minha Vida Menor" || !j.data) throw new Error("Arquivo inválido");
  state = { ...initial, ...j.data, notif: { ...initial.notif, ...(j.data.notif || {}) }, loaded: true };
  persist();
  emit();
}
export function wipeAll() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("mvm:fired");
  state = { ...initial, loaded: true };
  emit();
}
