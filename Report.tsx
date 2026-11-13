"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { todayStr, monthKey, monthLabel, shiftMonth, brDate, wFmt, f1, f0, bmi, bmiClass, wShow } from "@/lib/utils";
import { monthStats, measureChange, achievements } from "@/lib/calc";
import { Bars, Btn, Card, Chips, LineChart, Logo, Progress, Screen, type Nav } from "./ui";

export default function Report({ back }: Nav) {
  const s = useApp();
  const p = s.profile!;
  const unit = p.weightUnit;
  const cur = monthKey(todayStr());
  const [month, setMonth] = useState(shiftMonth(cur, new Date().getDate() <= 7 ? -1 : 0));
  const st = monthStats(s, month);
  const ach = achievements(s, month).filter((a) => a.done);
  const last6 = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5));
  const hist = last6.map((k) => ({ k, st: monthStats(s, k) }));
  const months = Array.from({ length: 12 }, (_, i) => shiftMonth(cur, -i));
  const fields = [["waist", "Cintura"], ["abdomen", "Abdômen"], ["hip", "Quadril"], ["arm", "Braços"], ["thigh", "Coxas"], ["bodyFat", "% gordura"]] as const;
  const symByType: Record<string, { n: number; sum: number }> = {};
  st.symptoms.forEach((x) => { const a = (symByType[x.type] ||= { n: 0, sum: 0 }); a.n++; a.sum += x.intensity; });
  const label = (k: string) => monthLabel(k).split(" de ")[0].slice(0, 3);
  const ended = month < cur;
  const age = p.birth ? Math.floor((Date.now() - new Date(p.birth).getTime()) / 31557600000) : null;
  const wPts = hist.filter((h) => h.st.endW !== undefined).map((h) => ({ label: label(h.k), value: wShow(h.st.endW as number, unit) }));

  return (
    <Screen title="Meu Relatório do Mês" onBack={back} right={<Btn variant="primary" className="no-print" onClick={() => window.print()}>📄 Exportar PDF</Btn>}>
      <div className="no-print space-y-2">
        <Chips options={months} value={month} onChange={setMonth} labels={Object.fromEntries(months.map((m) => [m, monthLabel(m)]))} />
        <p className="text-xs muted">O relatório é gerado automaticamente com seus registros. Para salvar em PDF, toque em “Exportar PDF” e escolha “Salvar como PDF” na tela de impressão.</p>
        {new Date().getDate() <= 7 && month === shiftMonth(cur, -1) && <div className="soft p-3 text-sm">✨ O relatório de {monthLabel(month)} já está pronto!</div>}
      </div>

      <Card className="space-y-1">
        <div className="flex items-center gap-3">
          <Logo size={52} />
          <div className="flex-1">
            <div className="text-lg font-bold">Minha Vida Menor</div>
            <div className="text-sm muted">Relatório de acompanhamento – <span className="capitalize">{monthLabel(month)}</span> {!ended && "(parcial)"}</div>
          </div>
        </div>
        <div className="text-sm muted">Paciente: {p.name || "—"}{age ? ` • ${age} anos` : ""} • Altura: {p.heightCm} cm • Gerado em {brDate(todayStr())}</div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold">⚖️ Peso</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="soft p-2"><div className="text-xs muted">Início do mês</div><b>{wFmt(st.startW, unit)}</b></div>
          <div className="soft p-2"><div className="text-xs muted">Final do mês</div><b>{wFmt(st.endW, unit)}</b></div>
          <div className="soft p-2"><div className="text-xs muted">Diferença</div><b>{st.diff === undefined ? "—" : `${st.diff > 0 ? "+" : "−"}${wFmt(Math.abs(st.diff), unit)}`}</b></div>
        </div>
        {st.endW !== undefined && <div className="text-sm muted">IMC ao final: {f1(bmi(st.endW, p.heightCm))} ({bmiClass(bmi(st.endW, p.heightCm))}) • Pesagens no mês: {st.weighIns}</div>}
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold">📏 Medidas corporais</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left muted"><th>Medida</th><th>Antes</th><th>Depois</th><th>Variação</th></tr></thead>
          <tbody>
            {fields.map(([k, l]) => {
              const c = measureChange(s, month, k);
              const u = k === "bodyFat" ? "%" : " cm";
              return <tr key={k}><td className="py-1">{l}</td><td>{c ? `${c.start}${u}` : "—"}</td><td>{c ? `${c.end}${u}` : "—"}</td><td>{c ? `${c.end - c.start > 0 ? "+" : ""}${f1(c.end - c.start)}` : "—"}</td></tr>;
            })}
          </tbody>
        </table>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold">💉 Aplicações</h3>
        <div className="text-sm">Aplicações registradas: <b>{st.injections}</b></div>
        {Object.keys(st.sites).length === 0 ? <div className="text-sm muted">Nenhuma aplicação no mês.</div> : (
          <ul className="text-sm">{Object.entries(st.sites).map(([k, v]) => <li key={k}>• {k}: {v}x</li>)}</ul>
        )}
        {s.meds.length > 0 && <div className="text-xs muted">Medicamentos cadastrados: {s.meds.map((m) => `${m.name}${m.dose ? ` (${m.dose})` : ""}`).join("; ")}</div>}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold">🌱 Hábitos</h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="soft p-2"><div className="text-xs muted">Consumo médio de água</div><b>{st.waterAvg ? `${f0(st.waterAvg)} mL/dia` : "—"}</b><div className="text-[10px] muted">meta {p.waterGoalMl} mL • atingida em {st.goalDays} dia(s)</div></div>
          <div className="soft p-2"><div className="text-xs muted">Dias com atividade física</div><b>{st.activeDays}</b></div>
          <div className="soft p-2"><div className="text-xs muted">Minutos de exercício</div><b>{st.minutes}</b></div>
          <div className="soft p-2"><div className="text-xs muted">Dias com registro no diário</div><b>{st.diaryDays}</b></div>
        </div>
        <div><div className="mb-1 flex justify-between text-sm"><span>Regularidade dos hábitos</span><b>{st.regular}%</b></div><Progress value={st.regular} max={100} /><p className="mt-1 text-[11px] muted">Combina dias com registro de água, dias ativos e pesagens. Mede constância, não resultado.</p></div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold">🩺 Sintomas registrados</h3>
        {st.symptoms.length === 0 ? <p className="text-sm muted">Nenhum sintoma registrado no mês.</p> : (
          <ul className="text-sm">{Object.entries(symByType).map(([k, v]) => <li key={k}>• {k}: {v.n} registro(s), intensidade média {(v.sum / v.n).toFixed(1)}/10</li>)}</ul>
        )}
      </Card>

      <Card className="space-y-2">
        <h3 className="font-bold">🏆 Conquistas do período</h3>
        {ach.length === 0 ? <p className="text-sm muted">Continue registrando para desbloquear conquistas.</p> : <div className="flex flex-wrap gap-2">{ach.map((a) => <span key={a.id} className="chip" style={{ background: "#fef9c3", color: "#713f12" }}>{a.icon} {a.title}</span>)}</div>}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-bold">📊 Comparação com meses anteriores</h3>
        <div><div className="mb-1 text-sm font-medium">Peso ao final do mês ({unit})</div><LineChart points={wPts} unit={` ${unit}`} /></div>
        <div><div className="mb-1 text-sm font-medium">Aplicações registradas</div><Bars data={hist.map((h) => ({ label: label(h.k), value: h.st.injections }))} color="#10b981" /></div>
        <div><div className="mb-1 text-sm font-medium">Dias com atividade física</div><Bars data={hist.map((h) => ({ label: label(h.k), value: h.st.activeDays }))} color="#f97316" /></div>
        <div><div className="mb-1 text-sm font-medium">Consumo médio de água (mL/dia)</div><Bars data={hist.map((h) => ({ label: label(h.k), value: Math.round(h.st.waterAvg) }))} goal={p.waterGoalMl} /></div>
      </Card>

      <p className="text-xs muted">
        Este relatório reúne apenas registros feitos pelo próprio usuário e serve para apoiar a conversa com o médico ou nutricionista. A variação de peso isoladamente não define o sucesso ou o insucesso do tratamento; a interpretação deve ser feita por profissional de saúde. Minha Vida Menor – Acompanhe, Cuide, Conquiste!
      </p>
    </Screen>
  );
}
