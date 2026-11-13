"use client";
import { useState } from "react";
import { useApp, upsert, remove, patchProfile, patchNotif, type Activity, type Symptom, type DiaryEntry } from "@/lib/store";
import { todayStr, nowTime, brDate, addDays, num, monthKey, diffDays, shortDate, fmtDate, parseDate } from "@/lib/utils";
import { waterOn, achievements } from "@/lib/calc";
import { messages, alertSigns } from "@/lib/knowledge";
import { Bars, Btn, Card, Chips, Empty, Field, Modal, MonthGrid, Progress, Screen, ask, type Nav } from "./ui";

/* ---------------- HIDRATAÇÃO ---------------- */
export function Water({ back }: Nav) {
  const s = useApp();
  const p = s.profile!;
  const today = todayStr();
  const ml = waterOn(s, today);
  const [custom, setCustom] = useState("");
  const [range, setRange] = useState<7 | 30>(7);
  const add = (v: number) => upsert("water", { date: today, time: nowTime(), ml: v });
  const days = Array.from({ length: range }, (_, i) => addDays(today, i - range + 1));
  const todayLogs = s.water.filter((w) => w.date === today).sort((a, b) => b.time.localeCompare(a.time));
  return (
    <Screen title="Hidratação" onBack={back}>
      <div className="hero space-y-3 p-4">
        <div className="flex items-end justify-between"><div className="text-4xl font-bold">{(ml / 1000).toFixed(2).replace(".", ",")} L</div><div className="text-sm opacity-90">meta: {(p.waterGoalMl / 1000).toFixed(2).replace(".", ",")} L</div></div>
        <Progress value={ml} max={p.waterGoalMl} color="#facc15" />
        <div className="text-sm">{ml >= p.waterGoalMl ? "🎉 Meta do dia atingida!" : `Faltam ${p.waterGoalMl - ml} mL`} • {Math.round(ml / p.cupMl * 10) / 10} copos</div>
        <div className="flex gap-2">
          <Btn variant="yellow" className="flex-1" onClick={() => add(p.cupMl)}>💧 + 1 copo ({p.cupMl} mL)</Btn>
        </div>
      </div>
      <Card className="space-y-2">
        <div className="flex gap-2">
          <input className="inp" inputMode="numeric" placeholder="Outro volume (mL)" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <Btn onClick={() => { const v = num(custom); if (v && v > 0) { add(v); setCustom(""); } }}>Adicionar</Btn>
        </div>
        {todayLogs.map((w) => (
          <div key={w.id} className="flex items-center justify-between text-sm"><span>{w.time}</span><span>{w.ml} mL</span><button aria-label="Excluir" onClick={() => remove("water", w.id)}>🗑</button></div>
        ))}
      </Card>
      <Card className="space-y-3">
        <h3 className="font-bold">Minhas preferências</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta diária (mL)"><input className="inp" inputMode="numeric" defaultValue={p.waterGoalMl} onBlur={(e) => { const v = num(e.target.value); if (v && v >= 500) patchProfile({ waterGoalMl: v }); }} /></Field>
          <Field label="Volume do copo (mL)"><input className="inp" inputMode="numeric" defaultValue={p.cupMl} onBlur={(e) => { const v = num(e.target.value); if (v && v >= 50) patchProfile({ cupMl: v }); }} /></Field>
        </div>
        <label className="flex items-center justify-between text-sm">Lembretes de água (a cada {s.notif.waterEveryH} h)
          <input type="checkbox" className="h-5 w-5 accent-emerald-600" checked={s.notif.water} onChange={(e) => { patchNotif({ water: e.target.checked }); if (e.target.checked && !s.notif.enabled) alert("Ative as notificações em Perfil → Notificações."); }} />
        </label>
        <p className="text-xs muted">A meta de água é pessoal. Converse com seu médico, principalmente se tem problemas nos rins ou no coração.</p>
      </Card>
      <Card className="space-y-2">
        <div className="flex items-center justify-between"><h3 className="font-bold">Histórico</h3><Chips options={["7", "30"]} value={String(range)} onChange={(v) => setRange(Number(v) as 7 | 30)} labels={{ 7: "7 dias", 30: "30 dias" }} /></div>
        <Bars data={days.map((d) => ({ label: shortDate(d).slice(0, range === 7 ? 5 : 2), value: waterOn(s, d) }))} goal={p.waterGoalMl} unit=" mL" />
        <p className="text-xs muted">Linha amarela = sua meta diária.</p>
      </Card>
    </Screen>
  );
}

/* ---------------- ATIVIDADES ---------------- */
const actTypes = ["Caminhada", "Corrida", "Musculação", "Bicicleta", "Natação", "Pilates", "Alongamento", "Outra"];
function weekStart(d: string) { const dt = parseDate(d); dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7)); return fmtDate(dt); }

export function Activities({ back }: Nav) {
  const s = useApp();
  const [month, setMonth] = useState(monthKey(todayStr()));
  const [sel, setSel] = useState<string | undefined>();
  const [form, setForm] = useState<(Omit<Activity, "distanceKm" | "minutes"> & { minutes: string; distance: string }) | null>(null);
  const inM = s.activities.filter((a) => monthKey(a.date) === month);
  const marks: Record<string, string[]> = {};
  inM.forEach((a) => (marks[a.date] = ["#f97316"]));
  const list = (sel ? s.activities.filter((a) => a.date === sel) : inM).sort((a, b) => b.date.localeCompare(a.date));
  const weeks = Array.from({ length: 8 }, (_, i) => weekStart(addDays(todayStr(), -7 * (7 - i))));
  const wk = weeks.map((w) => ({ label: shortDate(w), value: s.activities.filter((a) => weekStart(a.date) === w).reduce((x, a) => x + a.minutes, 0) }));
  const open = (a?: Activity) => setForm(a ? { ...a, minutes: String(a.minutes), distance: a.distanceKm !== undefined ? String(a.distanceKm) : "" } : { id: "", date: sel || todayStr(), type: "Caminhada", minutes: "30", intensity: "Moderada", notes: "", distance: "" });
  return (
    <Screen title="Atividades físicas" onBack={back} right={<Btn variant="primary" onClick={() => open()}>+ Registrar</Btn>}>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Card><div className="text-2xl font-bold text-orange-500">{new Set(inM.map((a) => a.date)).size}</div><div className="text-xs muted">dias ativos no mês</div></Card>
        <Card><div className="text-2xl font-bold text-orange-500">{inM.reduce((x, a) => x + a.minutes, 0)}</div><div className="text-xs muted">minutos no mês</div></Card>
        <Card><div className="text-2xl font-bold text-orange-500">{inM.length}</div><div className="text-xs muted">atividades</div></Card>
      </div>
      <Card><MonthGrid month={month} marks={marks} selected={sel} onSelect={(d) => setSel(d === sel ? undefined : d)} onMonth={(m) => { setMonth(m); setSel(undefined); }} /></Card>
      <Card><h3 className="mb-2 font-bold">Minutos por semana</h3><Bars data={wk} color="#f97316" unit=" min" /></Card>
      {list.length === 0 && <Empty text="Nenhuma atividade neste período." />}
      {list.map((a) => (
        <Card key={a.id} className="space-y-1">
          <div className="flex justify-between"><b>{a.type}</b><span className="text-sm muted">{brDate(a.date)}</span></div>
          <div className="text-sm">{a.minutes} min • {a.intensity}{a.distanceKm !== undefined && ` • ${a.distanceKm} km`}</div>
          {a.notes && <div className="text-sm muted">📝 {a.notes}</div>}
          <div className="flex gap-2 pt-1"><Btn className="!min-h-9" onClick={() => open(a)}>Editar</Btn><Btn className="!min-h-9" variant="danger" onClick={() => ask("Excluir atividade?") && remove("activities", a.id)}>Excluir</Btn></div>
        </Card>
      ))}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Editar atividade" : "Nova atividade"}>
        {form && (
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            const minutes = num(form.minutes);
            if (!minutes) return alert("Informe a duração.");
            upsert("activities", { id: form.id, date: form.date, type: form.type, minutes, intensity: form.intensity, distanceKm: num(form.distance), notes: form.notes });
            setForm(null);
          }}>
            <Field label="Tipo"><select className="inp" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{actTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Duração (min)"><input className="inp" inputMode="numeric" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} /></Field>
              <Field label="Intensidade"><select className="inp" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}><option>Leve</option><option>Moderada</option><option>Intensa</option></select></Field>
              <Field label="Distância (km)"><input className="inp" inputMode="decimal" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></Field>
            </div>
            <Field label="Observações"><textarea className="inp" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}

/* ---------------- SINTOMAS ---------------- */
const symTypes = ["Náuseas", "Constipação", "Diarreia", "Azia", "Refluxo", "Dor abdominal", "Dor de cabeça", "Fadiga", "Tontura", "Outro"];
const durations = ["Menos de 1 hora", "1 a 6 horas", "6 a 24 horas", "Mais de 1 dia"];

export function Symptoms({ back }: Nav) {
  const s = useApp();
  const [form, setForm] = useState<Symptom | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const since = addDays(todayStr(), -30);
  const recent = s.symptoms.filter((x) => x.date >= since);
  const byType = symTypes.map((t) => {
    const l = recent.filter((x) => x.type === t);
    return { t, n: l.length, avg: l.length ? l.reduce((a, b) => a + b.intensity, 0) / l.length : 0 };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  // Padrão: dias desde a última aplicação
  const pattern = Array.from({ length: 8 }, (_, d) => {
    const l = s.symptoms.filter((x) => {
      const prev = s.injections.filter((i) => i.date <= x.date).sort((a, b) => b.date.localeCompare(a.date))[0];
      return prev && diffDays(x.date, prev.date) === d;
    });
    return { label: `D${d}`, value: l.length ? Math.round((l.reduce((a, b) => a + b.intensity, 0) / l.length) * 10) / 10 : 0 };
  });
  const hasPattern = pattern.some((p) => p.value > 0);
  return (
    <Screen title="Diário de sintomas" onBack={back} right={<Btn variant="primary" onClick={() => setForm({ id: "", date: todayStr(), type: "Náuseas", intensity: 3, duration: durations[1], notes: "" })}>+ Registrar</Btn>}>
      <Card className="border-red-300 bg-red-50 !text-red-900 dark:!bg-red-950 dark:!text-red-100">
        <button className="w-full text-left font-bold" onClick={() => setShowAlert(!showAlert)}>🚨 Sinais de alerta: quando procurar atendimento {showAlert ? "▲" : "▼"}</button>
        {showAlert && (
          <div className="mt-2 space-y-1 text-sm">
            <p>Procure atendimento médico imediatamente (ou ligue 192/SAMU) se tiver:</p>
            <ul className="ml-5 list-disc">{alertSigns.map((a) => <li key={a}>{a}</li>)}</ul>
            <p className="pt-1 text-xs">Em caso de dúvida, fale com seu médico. Este aplicativo não faz diagnóstico.</p>
          </div>
        )}
      </Card>
      {byType.length > 0 && (
        <Card className="space-y-2">
          <h3 className="font-bold">Últimos 30 dias</h3>
          {byType.map((x) => (
            <div key={x.t}><div className="flex justify-between text-sm"><span>{x.t}</span><span className="muted">{x.n}x • intensidade média {x.avg.toFixed(1)}</span></div><Progress value={x.avg} max={10} color="#f59e0b" /></div>
          ))}
        </Card>
      )}
      {hasPattern && (
        <Card><h3 className="font-bold">Intensidade média × dias após a aplicação</h3><p className="mb-2 text-xs muted">D0 = dia da aplicação. Ajuda a identificar padrões para conversar com seu médico.</p><Bars data={pattern} color="#f59e0b" /></Card>
      )}
      {s.symptoms.length === 0 && <Empty text="Nenhum sintoma registrado." />}
      {[...s.symptoms].sort((a, b) => b.date.localeCompare(a.date)).map((x) => (
        <Card key={x.id} className="space-y-1">
          <div className="flex justify-between"><b>{x.type}</b><span className="text-sm muted">{brDate(x.date)}</span></div>
          <div className="text-sm">Intensidade {x.intensity}/10 • {x.duration}</div>
          {x.notes && <div className="text-sm muted">📝 {x.notes}</div>}
          <div className="flex gap-2 pt-1"><Btn className="!min-h-9" onClick={() => setForm(x)}>Editar</Btn><Btn className="!min-h-9" variant="danger" onClick={() => ask("Excluir sintoma?") && remove("symptoms", x.id)}>Excluir</Btn></div>
        </Card>
      ))}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Editar sintoma" : "Registrar sintoma"}>
        {form && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); upsert("symptoms", form); setForm(null); }}>
            <Field label="Sintoma"><select className="inp" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{symTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label={`Intensidade: ${form.intensity}/10`}><input type="range" min={1} max={10} className="w-full accent-emerald-600" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Duração"><select className="inp" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>{durations.map((d) => <option key={d}>{d}</option>)}</select></Field>
            </div>
            <Field label="Observações"><textarea className="inp" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            {form.intensity >= 8 && <p className="rounded-xl bg-red-50 p-2 text-sm text-red-800">Sintomas intensos merecem avaliação. Fale com seu médico ou procure atendimento.</p>}
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}

/* ---------------- DIÁRIO ---------------- */
const moods = ["😄", "🙂", "😐", "😔", "😣", "😴"];
export function Diary({ back }: Nav) {
  const s = useApp();
  const [form, setForm] = useState<DiaryEntry | null>(null);
  const ach = achievements(s);
  const day = Math.floor(Date.now() / 86400000);
  return (
    <Screen title="Diário e conquistas" onBack={back} right={<Btn variant="primary" onClick={() => setForm({ id: "", date: todayStr(), mood: "🙂", text: "" })}>+ Escrever</Btn>}>
      <div className="hero p-4 text-center text-lg font-medium">“{messages[day % messages.length]}”</div>
      <Card>
        <h3 className="mb-2 font-bold">🏆 Conquistas ({ach.filter((a) => a.done).length}/{ach.length})</h3>
        <div className="grid grid-cols-3 gap-2">
          {ach.map((a) => (
            <div key={a.id} className="rounded-2xl p-2 text-center" style={{ background: a.done ? "#fef9c3" : "var(--soft)", opacity: a.done ? 1 : 0.55, color: a.done ? "#713f12" : undefined }}>
              <div className="text-2xl">{a.done ? a.icon : "🔒"}</div><div className="text-[11px] font-bold leading-tight">{a.title}</div><div className="text-[9px]">{a.desc}</div>
            </div>
          ))}
        </div>
      </Card>
      {s.diary.length === 0 && <Empty text="Escreva sobre seus sentimentos, dificuldades e conquistas." />}
      {[...s.diary].sort((a, b) => b.date.localeCompare(a.date)).map((d) => (
        <Card key={d.id} className="space-y-1">
          <div className="flex justify-between"><span className="text-2xl">{d.mood}</span><span className="text-sm muted">{brDate(d.date)}</span></div>
          <p className="whitespace-pre-wrap text-sm">{d.text}</p>
          <div className="flex gap-2 pt-1"><Btn className="!min-h-9" onClick={() => setForm(d)}>Editar</Btn><Btn className="!min-h-9" variant="danger" onClick={() => ask("Excluir anotação?") && remove("diary", d.id)}>Excluir</Btn></div>
        </Card>
      ))}
      <Modal open={!!form} onClose={() => setForm(null)} title="Diário pessoal">
        {form && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!form.text.trim()) return; upsert("diary", form); setForm(null); }}>
            <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <div className="flex justify-between">{moods.map((m) => <button type="button" key={m} className={`rounded-2xl p-2 text-3xl ${form.mood === m ? "bg-emerald-200" : ""}`} onClick={() => setForm({ ...form, mood: m })}>{m}</button>)}</div>
            <Field label="Como você está se sentindo?"><textarea className="inp" rows={6} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Sentimentos, dificuldades, conquistas..." /></Field>
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}
