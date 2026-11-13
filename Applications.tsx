"use client";
import { useState } from "react";
import { useApp, upsert, remove, regionNames, type Injection, type Region } from "@/lib/store";
import { todayStr, nowTime, brDate, addDays, diffDays } from "@/lib/utils";
import { lastUse, nextApplication } from "@/lib/calc";
import { Btn, Card, Empty, Field, Modal, Screen, Tabs, ask, type Nav } from "./ui";

const sideOf = (r: Region) => (r === "abdomen" ? "Direito" : r.endsWith("_d") ? "Direito" : "Esquerdo");
const reactionsList = ["Nenhuma", "Vermelhidão", "Dor", "Inchaço", "Coceira", "Hematoma", "Nódulo", "Sangramento"];

function heatColor(days: number | undefined) {
  if (days === undefined) return "var(--soft)";
  if (days <= 7) return "#f59e0b";
  if (days <= 14) return "#fde047";
  return "#6ee7b7";
}

type Pick = { region: Region; side: string };

function BodyMap({ view, period, onPick }: { view: "front" | "back"; period: number; onPick: (p: Pick) => void }) {
  const s = useApp();
  const days = (key: string) => {
    const l = lastUse(s, key, period).last;
    return l ? diffDays(todayStr(), l) : undefined;
  };
  const front = view === "front";
  const shape = (x: number, y: number, w: number, h: number, rx: number, key: string, pick: Pick, label: string, rot?: string) => {
    const d = days(key);
    return (
      <g key={key + x} role="button" aria-label={label} style={{ cursor: "pointer" }} onClick={() => onPick(pick)}>
        <rect x={x} y={y} width={w} height={h} rx={rx} fill={heatColor(d)} stroke={d === undefined ? "#94a3b8" : "#065f46"}
          strokeWidth={d === undefined ? 1.5 : 1} strokeDasharray={d === undefined ? "4 3" : undefined} transform={rot} />
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1f2937">{d === undefined ? "" : d === 0 ? "hoje" : `${d}d`}</text>
      </g>
    );
  };
  // Na vista frontal, o lado direito da pessoa fica à esquerda de quem olha; nas costas, é invertido.
  const L: Region[] = front ? ["braco_d", "coxa_d"] : ["braco_e", "coxa_e"];
  const R: Region[] = front ? ["braco_e", "coxa_e"] : ["braco_d", "coxa_d"];
  return (
    <svg viewBox="0 0 200 345" className="mx-auto w-full max-w-[260px]" role="img" aria-label="Mapa corporal">
      <circle cx="100" cy="30" r="20" fill="#cfe3dd" />
      <rect x="92" y="48" width="16" height="14" fill="#cfe3dd" />
      <path d="M62 64 Q100 54 138 64 L134 200 Q100 208 66 200 Z" fill="#cfe3dd" />
      <rect x="70" y="300" width="24" height="40" rx="10" fill="#cfe3dd" />
      <rect x="106" y="300" width="24" height="40" rx="10" fill="#cfe3dd" />
      {front ? (
        <>
          {shape(68, 128, 31, 58, 10, "abdomen:Direito", { region: "abdomen", side: "Direito" }, "Abdômen, lado direito")}
          {shape(101, 128, 31, 58, 10, "abdomen:Esquerdo", { region: "abdomen", side: "Esquerdo" }, "Abdômen, lado esquerdo")}
        </>
      ) : (
        <text x="100" y="160" textAnchor="middle" fontSize="10" fill="#64748b">costas</text>
      )}
      {shape(30, 70, 26, 106, 13, L[0], { region: L[0], side: sideOf(L[0]) }, regionNames[L[0]], "rotate(6 43 70)")}
      {shape(144, 70, 26, 106, 13, R[0], { region: R[0], side: sideOf(R[0]) }, regionNames[R[0]], "rotate(-6 157 70)")}
      {shape(66, 206, 32, 90, 14, L[1], { region: L[1], side: sideOf(L[1]) }, regionNames[L[1]])}
      {shape(102, 206, 32, 90, 14, R[1], { region: R[1], side: sideOf(R[1]) }, regionNames[R[1]])}
      <text x="12" y="22" fontSize="10" fill="#64748b">{front ? "D" : "E"}</text>
      <text x="182" y="22" fontSize="10" fill="#64748b">{front ? "E" : "D"}</text>
    </svg>
  );
}

export default function Applications({ go, back }: Nav) {
  const s = useApp();
  const [tab, setTab] = useState<"mapa" | "hist">("mapa");
  const [view, setView] = useState<"front" | "back">("front");
  const [period, setPeriod] = useState(30);
  const [form, setForm] = useState<Injection | null>(null);
  const next = nextApplication(s);

  const newForm = (p?: Pick): Injection => {
    const med = s.meds.filter((m) => !m.ended)[0] || s.meds[0];
    const region = p?.region || "abdomen";
    return { id: "", date: todayStr(), time: nowTime(), medId: med?.id || "", dose: med?.dose || "", region, side: p?.side || sideOf(region), area: "", notes: "", reactions: [] };
  };
  const open = (p?: Pick) => {
    if (s.meds.length === 0) { alert("Cadastre primeiro um medicamento em “Meus Medicamentos”."); go("meds"); return; }
    setForm(newForm(p));
  };
  const set = <K extends keyof Injection>(k: K, v: Injection[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const sorted = [...s.injections].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const rows: { key: string; label: string }[] = [
    { key: "abdomen:Direito", label: "Abdômen – lado direito" }, { key: "abdomen:Esquerdo", label: "Abdômen – lado esquerdo" },
    { key: "coxa_d", label: "Coxa direita" }, { key: "coxa_e", label: "Coxa esquerda" },
    { key: "braco_d", label: "Braço direito" }, { key: "braco_e", label: "Braço esquerdo" },
  ];
  const count = (key: string, d: number) => lastUse(s, key, d).count;

  return (
    <Screen title="Aplicações" onBack={back} right={<Btn variant="primary" onClick={() => open()}>+ Registrar</Btn>}>
      <div className="hero p-4">
        <div className="text-sm opacity-90">Próxima aplicação prevista</div>
        {next ? (
          <>
            <div className="text-2xl font-bold">{brDate(next.date)}</div>
            <div className="text-sm opacity-90">{next.med.name} {next.med.dose && `• ${next.med.dose}`} {next.overdue ? "• data prevista já passou" : next.days === 0 ? "• hoje" : `• em ${next.days} dia(s)`}</div>
          </>
        ) : <div className="text-sm">Cadastre um medicamento para ver a programação.</div>}
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => go("calendar")} className="!min-h-10">📅 Calendário</Btn>
          <Btn onClick={() => go("meds")} className="!min-h-10">💊 Medicamentos</Btn>
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} options={[{ id: "mapa", label: "Mapa corporal" }, { id: "hist", label: "Histórico" }]} />

      {tab === "mapa" && (
        <>
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button className={`chip ${view === "front" ? "chip-on" : ""}`} onClick={() => setView("front")}>Frente</button>
                <button className={`chip ${view === "back" ? "chip-on" : ""}`} onClick={() => setView("back")}>Costas</button>
              </div>
              <select className="inp !w-auto !min-h-9 !py-1" value={period} onChange={(e) => setPeriod(Number(e.target.value))} aria-label="Período">
                <option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option>
              </select>
            </div>
            <BodyMap view={view} period={period} onPick={(p) => open(p)} />
            <p className="text-center text-xs muted">Toque em uma região para registrar a aplicação. {view === "back" && "Na vista de costas, o abdômen não é exibido."}</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span><i className="mr-1 inline-block h-3 w-3 rounded" style={{ background: "#f59e0b" }} />Usada há 0–7 dias</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded" style={{ background: "#fde047" }} />Usada há 8–14 dias</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded" style={{ background: "#6ee7b7" }} />Usada há mais de 14 dias</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded border border-dashed border-slate-400" style={{ background: "var(--soft)" }} />Sem registro no período</span>
            </div>
          </Card>
          <Card>
            <h3 className="mb-2 font-bold">Resumo do rodízio ({period} dias)</h3>
            <div className="space-y-2">
              {rows.map((r) => {
                const u = lastUse(s, r.key, period);
                return (
                  <div key={r.key} className="flex items-center justify-between text-sm">
                    <span>{r.label}</span>
                    <span className="muted">{u.last ? `última: ${brDate(u.last)} • ${u.count}x` : "ainda não utilizada no período"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs muted">O mapa é apenas um registro visual do que você já fez. A escolha do local deve seguir a bula do medicamento e a orientação do seu médico.</p>
          </Card>
        </>
      )}

      {tab === "hist" && (
        <>
          <Card>
            <h3 className="mb-2 font-bold">Semana × mês</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left muted"><th>Região</th><th>7 dias</th><th>30 dias</th></tr></thead>
              <tbody>
                {rows.map((r) => <tr key={r.key}><td className="py-1">{r.label}</td><td>{count(r.key, 7)}</td><td>{count(r.key, 30)}</td></tr>)}
                <tr className="font-bold"><td className="py-1">Total</td>
                  <td>{s.injections.filter((i) => i.date >= addDays(todayStr(), -7)).length}</td>
                  <td>{s.injections.filter((i) => i.date >= addDays(todayStr(), -30)).length}</td></tr>
              </tbody>
            </table>
          </Card>
          {sorted.length === 0 && <Empty text="Nenhuma aplicação registrada ainda." />}
          {sorted.map((i) => {
            const med = s.meds.find((m) => m.id === i.medId);
            return (
              <Card key={i.id} className="space-y-1">
                <div className="flex justify-between">
                  <b>{brDate(i.date)} às {i.time}</b>
                  <span className="text-sm muted">{med?.name || "Medicamento removido"}</span>
                </div>
                <div className="text-sm">{regionNames[i.region]}{i.region === "abdomen" ? ` – lado ${i.side.toLowerCase()}` : ""}{i.area && ` (${i.area.toLowerCase()})`} • Dose: {i.dose || "—"}</div>
                {i.reactions.length > 0 && <div className="text-sm">Reações: {i.reactions.join(", ")}</div>}
                {i.notes && <div className="text-sm muted">📝 {i.notes}</div>}
                <div className="flex gap-2 pt-1">
                  <Btn className="!min-h-9" onClick={() => setForm(i)}>Editar</Btn>
                  <Btn className="!min-h-9" variant="danger" onClick={() => ask("Excluir esta aplicação?") && remove("injections", i.id)}>Excluir</Btn>
                </div>
              </Card>
            );
          })}
        </>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Editar aplicação" : "Registrar aplicação"}>
        {form && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); upsert("injections", form); setForm(null); }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => set("date", e.target.value)} required /></Field>
              <Field label="Horário"><input type="time" className="inp" value={form.time} onChange={(e) => set("time", e.target.value)} required /></Field>
            </div>
            <Field label="Medicamento">
              <select className="inp" value={form.medId} onChange={(e) => { const m = s.meds.find((x) => x.id === e.target.value); setForm({ ...form, medId: e.target.value, dose: m?.dose || form.dose }); }}>
                {s.meds.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Dose prescrita aplicada" hint="Informe a dose conforme a sua receita."><input className="inp" value={form.dose} onChange={(e) => set("dose", e.target.value)} /></Field>
            <Field label="Região corporal">
              <select className="inp" value={form.region} onChange={(e) => { const r = e.target.value as Region; setForm({ ...form, region: r, side: sideOf(r) }); }}>
                {(Object.keys(regionNames) as Region[]).map((r) => <option key={r} value={r}>{regionNames[r]}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lado utilizado">
                {form.region === "abdomen" ? (
                  <select className="inp" value={form.side} onChange={(e) => set("side", e.target.value)}><option>Direito</option><option>Esquerdo</option></select>
                ) : <input className="inp" readOnly value={sideOf(form.region)} />}
              </Field>
              <Field label="Área (opcional)">
                <select className="inp" value={form.area} onChange={(e) => set("area", e.target.value)}>
                  <option value="">—</option><option>Frontal</option><option>Lateral</option><option>Posterior</option>
                </select>
              </Field>
            </div>
            <Field label="Reações no local">
              <div className="flex flex-wrap gap-2">
                {reactionsList.map((r) => {
                  const on = form.reactions.includes(r);
                  return <button type="button" key={r} className={`chip ${on ? "chip-on" : ""}`}
                    onClick={() => set("reactions", r === "Nenhuma" ? (on ? [] : ["Nenhuma"]) : on ? form.reactions.filter((x) => x !== r) : [...form.reactions.filter((x) => x !== "Nenhuma"), r])}>{r}</button>;
                })}
              </div>
            </Field>
            <Field label="Observações"><textarea className="inp" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
            <Btn type="submit" variant="primary" className="w-full">Salvar aplicação</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}
