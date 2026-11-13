"use client";
import { useState } from "react";
import { useApp, upsert, remove, type CalEvent } from "@/lib/store";
import { todayStr, monthKey, brDate, addDays } from "@/lib/utils";
import { freqDays, nextDose, waterOn } from "@/lib/calc";
import { Btn, Card, Field, Modal, MonthGrid, Screen, ask, type Nav } from "./ui";

const C = { inj: "#10b981", plan: "#3b82f6", weigh: "#6366f1", act: "#f97316", water: "#06b6d4", consulta: "#a855f7", exame: "#ec4899", med: "#eab308" };

export default function Calendar({ back }: Nav) {
  const s = useApp();
  const [month, setMonth] = useState(monthKey(todayStr()));
  const [sel, setSel] = useState(todayStr());
  const [form, setForm] = useState<CalEvent | null>(null);

  const planned: Record<string, string[]> = {};
  s.meds.filter((m) => !m.ended).forEach((m) => {
    let d = nextDose(m, s.injections).date;
    for (let i = 0; i < 40 && d <= addDays(todayStr(), 180); i++) {
      (planned[d] ||= []).push(m.name);
      d = addDays(d, freqDays[m.frequency] || 7);
    }
  });

  const marks: Record<string, string[]> = {};
  const mk = (d: string, c: string) => { const a = (marks[d] ||= []); if (!a.includes(c)) a.push(c); };
  s.injections.forEach((i) => mk(i.date, C.inj));
  Object.keys(planned).forEach((d) => mk(d, C.plan));
  s.measures.forEach((m) => { if (m.weight !== undefined) mk(m.date, C.weigh); if (m.waist || m.abdomen || m.hip || m.arm || m.thigh) mk(m.date, C.med); });
  s.activities.forEach((a) => mk(a.date, C.act));
  const wdays = new Set(s.water.map((w) => w.date));
  wdays.forEach((d) => { if (s.profile && waterOn(s, d) >= s.profile.waterGoalMl) mk(d, C.water); });
  s.events.forEach((e) => mk(e.date, e.kind === "Exame" ? C.exame : C.consulta));

  const dayInj = s.injections.filter((i) => i.date === sel);
  const dayMeas = s.measures.filter((m) => m.date === sel);
  const dayAct = s.activities.filter((a) => a.date === sel);
  const dayEv = s.events.filter((e) => e.date === sel);
  const dayWater = waterOn(s, sel);
  const dayPlan = planned[sel] || [];
  const nothing = !dayInj.length && !dayMeas.length && !dayAct.length && !dayEv.length && !dayWater && !dayPlan.length;

  return (
    <Screen title="Calendário" onBack={back} right={<Btn variant="primary" onClick={() => setForm({ id: "", date: sel, time: "", kind: "Consulta", title: "", notes: "" })}>+ Evento</Btn>}>
      <Card><MonthGrid month={month} marks={marks} selected={sel} onSelect={setSel} onMonth={setMonth} /></Card>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {[["Aplicação registrada", C.inj], ["Aplicação prevista", C.plan], ["Pesagem", C.weigh], ["Medidas", C.med], ["Atividade física", C.act], ["Meta de água atingida", C.water], ["Consulta", C.consulta], ["Exame", C.exame]].map(([l, c]) => (
          <span key={l}><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>
        ))}
      </div>
      <Card className="space-y-2">
        <h3 className="font-bold">{brDate(sel)}</h3>
        {nothing && <p className="text-sm muted">Nada registrado neste dia.</p>}
        {dayPlan.map((n, i) => <div key={i} className="text-sm">🗓 Aplicação prevista: <b>{n}</b></div>)}
        {dayInj.map((i) => <div key={i.id} className="text-sm">💉 Aplicação às {i.time} • {i.dose}</div>)}
        {dayMeas.map((m) => <div key={m.id} className="text-sm">📏 Medidas{m.weight !== undefined && ` • ${m.weight.toFixed(1)} kg`}</div>)}
        {dayAct.map((a) => <div key={a.id} className="text-sm">🏃 {a.type} • {a.minutes} min</div>)}
        {dayWater > 0 && <div className="text-sm">💧 Água: {dayWater} mL</div>}
        {dayEv.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-sm">
            <span>{e.kind === "Exame" ? "🧪" : "🩺"} {e.kind}: <b>{e.title}</b> {e.time && `às ${e.time}`}{e.notes && ` — ${e.notes}`}</span>
            <span className="flex gap-2"><button onClick={() => setForm(e)}>✏️</button><button onClick={() => ask("Excluir evento?") && remove("events", e.id)}>🗑</button></span>
          </div>
        ))}
      </Card>
      <Modal open={!!form} onClose={() => setForm(null)} title="Evento">
        {form && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!form.title.trim()) return alert("Informe um título."); upsert("events", form); setForm(null); }}>
            <Field label="Tipo"><select className="inp" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}><option>Consulta</option><option>Exame</option><option>Outro</option></select></Field>
            <Field label="Título"><input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Endocrinologista" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Horário"><input type="time" className="inp" value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            </div>
            <Field label="Observações"><textarea className="inp" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}
