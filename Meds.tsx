"use client";
import { useState } from "react";
import { useApp, upsert, remove, regionNames, type Med, type Frequency } from "@/lib/store";
import { todayStr, weekdays, brDate } from "@/lib/utils";
import { nextDose } from "@/lib/calc";
import { Btn, Card, Empty, Field, Modal, Screen, ask, type Nav } from "./ui";

const blank = (): Med => ({
  id: "", name: "", brand: "", active: "", concentration: "", dose: "", startDate: todayStr(),
  frequency: "Semanal", weekday: new Date().getDay(), time: "08:00", notes: "",
});

export default function Meds({ back }: Nav) {
  const s = useApp();
  const [form, setForm] = useState<Med | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const set = <K extends keyof Med>(k: K, v: Med[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <Screen title="Meus Medicamentos" onBack={back} right={<Btn variant="primary" onClick={() => setForm(blank())}>+ Novo</Btn>}>
      <p className="text-sm muted">
        Cadastre exatamente o que foi prescrito pelo seu médico. O aplicativo não sugere doses nem alterações de tratamento.
      </p>
      {s.meds.length === 0 && <Empty text="Nenhum medicamento cadastrado. Toque em “+ Novo” para começar." />}
      {s.meds.map((m) => {
        const nd = nextDose(m, s.injections);
        const hist = s.injections.filter((i) => i.medId === m.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
        return (
          <Card key={m.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-lg font-bold">{m.name || m.brand} {m.ended && <span className="chip">Encerrado</span>}</div>
                <div className="text-sm muted">{[m.brand, m.active, m.concentration].filter(Boolean).join(" • ")}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{m.dose || "—"}</div>
                <div className="muted">{m.frequency}</div>
              </div>
            </div>
            <div className="text-sm muted">
              Início: {brDate(m.startDate)} • {m.frequency === "Diária" ? "" : weekdays[m.weekday] + ", "}{m.time}
            </div>
            {!m.ended && (
              <div className="soft p-2 text-sm">
                Próxima aplicação prevista: <b>{brDate(nd.date)}</b> {nd.overdue ? <span className="font-semibold text-red-600">(data prevista já passou)</span> : nd.days === 0 ? "(hoje)" : `(em ${nd.days} dia${nd.days > 1 ? "s" : ""})`}
              </div>
            )}
            {m.notes && <p className="text-sm">📝 {m.notes}</p>}
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => setOpen(open === m.id ? null : m.id)}>Histórico ({hist.length})</Btn>
              <Btn onClick={() => setForm(m)}>Editar</Btn>
              <Btn onClick={() => upsert("meds", { ...m, ended: !m.ended })}>{m.ended ? "Reativar" : "Encerrar"}</Btn>
              <Btn variant="danger" onClick={() => ask("Excluir este medicamento? As aplicações registradas serão mantidas.") && remove("meds", m.id)}>Excluir</Btn>
            </div>
            {open === m.id && (
              <div className="space-y-1 border-t pt-2" style={{ borderColor: "var(--line)" }}>
                {hist.length === 0 && <p className="text-sm muted">Nenhuma aplicação registrada para este medicamento.</p>}
                {hist.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span>{brDate(i.date)} às {i.time}</span>
                    <span className="muted">{i.dose} • {regionNames[i.region]}{i.region === "abdomen" ? ` (${i.side.toLowerCase()})` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Editar medicamento" : "Novo medicamento"}>
        {form && (
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return alert("Informe o nome do medicamento.");
            upsert("meds", form);
            setForm(null);
          }}>
            <Field label="Nome do medicamento">
              <input className="inp" list="med-names" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Mounjaro" />
              <datalist id="med-names"><option value="Mounjaro" /><option value="Tirzepatida manipulada" /><option value="Ozempic" /><option value="Wegovy" /><option value="Saxenda" /></datalist>
            </Field>
            <Field label="Marca / fabricante"><input className="inp" value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
            <Field label="Princípio ativo"><input className="inp" value={form.active} onChange={(e) => set("active", e.target.value)} placeholder="Ex.: Tirzepatida" /></Field>
            <Field label="Concentração informada na embalagem"><input className="inp" value={form.concentration} onChange={(e) => set("concentration", e.target.value)} placeholder="Ex.: 5 mg/0,5 mL" /></Field>
            <Field label="Dose prescrita"><input className="inp" value={form.dose} onChange={(e) => set("dose", e.target.value)} placeholder="Conforme a receita médica" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data de início"><input type="date" className="inp" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
              <Field label="Frequência prescrita">
                <select className="inp" value={form.frequency} onChange={(e) => set("frequency", e.target.value as Frequency)}>
                  <option>Semanal</option><option>Diária</option><option>Quinzenal</option><option>Mensal</option>
                </select>
              </Field>
              <Field label="Dia habitual">
                <select className="inp" value={form.weekday} onChange={(e) => set("weekday", Number(e.target.value))}>
                  {weekdays.map((w, i) => <option key={i} value={i}>{w}</option>)}
                </select>
              </Field>
              <Field label="Horário habitual"><input type="time" className="inp" value={form.time} onChange={(e) => set("time", e.target.value)} /></Field>
            </div>
            <Field label="Observações"><textarea className="inp" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
            <p className="text-xs muted">A data de início define a primeira aplicação prevista. As seguintes são calculadas a partir da última aplicação registrada.</p>
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}
