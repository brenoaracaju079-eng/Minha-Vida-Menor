"use client";
import { useApp, upsert } from "@/lib/store";
import { todayStr, nowTime, addDays, brDate, bmi, bmiClass, f1, wFmt, wShow, monthKey, shortDate } from "@/lib/utils";
import { currentWeight, nextApplication, waterOn, weighings } from "@/lib/calc";
import { messages } from "@/lib/knowledge";
import { Card, LineChart, Logo, Progress, type Nav } from "./ui";

export default function Home({ go, installPrompt }: Nav & { installPrompt?: () => void }) {
  const s = useApp();
  const p = s.profile!;
  const unit = p.weightUnit;
  const today = todayStr();
  const w = weighings(s);
  const cur = currentWeight(s);
  const lost = p.startWeight - cur;
  const b = bmi(cur, p.heightCm);
  const water = waterOn(s, today);
  const next = nextApplication(s);
  const mk = monthKey(today);
  const activeDays = new Set(s.activities.filter((a) => monthKey(a.date) === mk).map((a) => a.date)).size;
  let weekly: number | undefined;
  if (w.length >= 2) {
    const last = w[w.length - 1];
    const ref = [...w].reverse().find((x) => x.date <= addDays(last.date, -7)) || w[0];
    if (ref !== last) weekly = (last.weight as number) - (ref.weight as number);
  }
  const msg = messages[Math.floor(Date.now() / 86400000) % messages.length];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const points = w.slice(-12).map((x) => ({ label: shortDate(x.date), value: wShow(x.weight as number, unit) }));

  const Stat = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
    <Card className="!p-3"><div className="text-xs muted">{label}</div><div className="text-xl font-bold" style={{ color }}>{value}</div>{sub && <div className="text-[11px] muted">{sub}</div>}</Card>
  );
  const quick: [string, string, string][] = [
    ["💉", "Aplicação", "apps"], ["⚖️", "Pesar", "evo"], ["💧", "Água", "water"], ["🏃", "Atividade", "activity"],
    ["🍽️", "Receitas", "food"], ["🩺", "Sintomas", "symptoms"], ["📓", "Diário", "diary"], ["📄", "Relatório", "report"],
  ];
  return (
    <div className="space-y-4">
      <div className="hero flex items-center gap-3 p-4">
        <div className="rounded-2xl bg-white/90 p-1.5"><Logo size={46} /></div>
        <div className="flex-1">
          <div className="text-sm opacity-90">{greet},</div>
          <div className="text-xl font-bold">{p.name.split(" ")[0]}!</div>
          <div className="text-xs opacity-90">Acompanhe, Cuide, Conquiste!</div>
        </div>
      </div>
      {installPrompt && (
        <button className="btn btn-yellow w-full" onClick={installPrompt}>📲 Instalar aplicativo no celular</button>
      )}
      <Card className="!bg-[#fef9c3] !text-[#713f12] !border-[#fde047]"><div className="text-xs font-bold uppercase tracking-wide">Mensagem do dia</div><p className="mt-1 font-medium">{msg}</p></Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Peso atual" value={wFmt(cur, unit)} color="var(--em)" />
        <Stat label="Peso inicial" value={wFmt(p.startWeight, unit)} />
        <Stat label="Meta de peso" value={wFmt(p.goalWeight, unit)} color="#a16207" />
        <Stat label="Eliminados" value={`${lost >= 0 ? "" : "+"}${f1(wShow(Math.abs(lost), unit))} ${unit}`} sub={lost < 0 ? "acima do peso inicial" : undefined} color="var(--tq)" />
        <Stat label="IMC" value={f1(b)} sub={bmiClass(b)} />
        <Stat label="Dias ativos no mês" value={String(activeDays)} color="#f97316" />
      </div>

      <Card className="space-y-2 cursor-pointer" onClick={() => go("water")}>
        <div className="flex justify-between"><b>💧 Água hoje</b><span className="text-sm muted">{water} / {p.waterGoalMl} mL</span></div>
        <Progress value={water} max={p.waterGoalMl} color="#14b8a6" />
        <button className="btn btn-primary w-full !min-h-10" onClick={(e) => { e.stopPropagation(); upsert("water", { date: today, time: nowTime(), ml: p.cupMl }); }}>+ 1 copo ({p.cupMl} mL)</button>
      </Card>

      <Card className="cursor-pointer" onClick={() => go("apps")}>
        <b>💉 Próxima aplicação</b>
        {next ? (
          <div className="mt-1"><div className="text-lg font-bold">{brDate(next.date)} <span className="text-sm font-normal muted">{next.med.name}</span></div>
            <div className="text-sm muted">{next.overdue ? "A data prevista já passou." : next.days === 0 ? "É hoje!" : `Em ${next.days} dia(s)`}</div></div>
        ) : <div className="text-sm muted">Cadastre seu medicamento para acompanhar a programação.</div>}
      </Card>

      <Card className="space-y-2">
        <div className="flex justify-between"><b>📉 Evolução do peso</b><span className="text-sm muted">{weekly === undefined ? "—" : `semana: ${weekly > 0 ? "+" : "−"}${f1(Math.abs(wShow(weekly, unit)))} ${unit}`}</span></div>
        <LineChart points={points} goal={wShow(p.goalWeight, unit)} unit={` ${unit}`} />
      </Card>

      <div>
        <h2 className="mb-2 font-bold">Acesso rápido</h2>
        <div className="grid grid-cols-4 gap-2">
          {quick.map(([i, l, r]) => (
            <button key={r} className="card flex flex-col items-center gap-1 !p-2" onClick={() => go(r)}><span className="text-2xl">{i}</span><span className="text-[11px] font-medium">{l}</span></button>
          ))}
        </div>
      </div>
    </div>
  );
}
