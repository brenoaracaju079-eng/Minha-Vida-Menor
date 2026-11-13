"use client";
import { useState } from "react";
import { useApp, setState } from "@/lib/store";
import { sha256, todayStr, num, wStore, uid } from "@/lib/utils";
import { unlockBiometric } from "@/lib/security";
import { Btn, Field, Logo } from "./ui";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const s = useApp();
  const p = s.profile!;
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const submit = async (v: string) => {
    if ((await sha256(v)) === p.pinHash) onUnlock();
    else { setErr("Senha incorreta"); setPin(""); }
  };
  const press = (d: string) => {
    if (pin.length >= 6) return;
    const v = pin + d;
    setPin(v); setErr("");
    if (v.length >= 4 && v.length === 6) submit(v);
  };
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 p-6" style={{ background: "var(--bg)" }}>
      <Logo size={80} />
      <h1 className="text-xl font-bold">Minha Vida Menor</h1>
      <p className="text-sm muted">Digite sua senha (4 a 6 dígitos)</p>
      <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-3 w-3 rounded-full" style={{ background: i < pin.length ? "var(--em)" : "var(--line)" }} />)}</div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} className="btn !h-16 !w-16 !rounded-full text-xl" onClick={() => press(d)}>{d}</button>)}
        {p.bioCredId ? <button className="btn !h-16 !w-16 !rounded-full text-2xl" aria-label="Biometria" onClick={async () => { if (await unlockBiometric(p.bioCredId!)) onUnlock(); else setErr("Biometria não reconhecida"); }}>👆</button> : <span />}
        <button className="btn !h-16 !w-16 !rounded-full text-xl" onClick={() => press("0")}>0</button>
        <button className="btn !h-16 !w-16 !rounded-full text-xl" aria-label="Apagar" onClick={() => setPin(pin.slice(0, -1))}>⌫</button>
      </div>
      <Btn variant="primary" disabled={pin.length < 4} onClick={() => submit(pin)}>Entrar</Btn>
    </div>
  );
}

export function Onboarding() {
  const [f, setF] = useState({ name: "", sex: "F", birth: "", height: "", start: "", goal: "" });
  const [ok, setOk] = useState(false);
  const save = () => {
    const height = num(f.height), start = num(f.start), goal = num(f.goal);
    if (!f.name.trim() || !height || !start || !goal) return alert("Preencha nome, altura, peso inicial e meta de peso.");
    if (!ok) return alert("Confirme que está ciente do aviso.");
    setState((s) => ({
      ...s,
      profile: {
        name: f.name.trim(), sex: f.sex as "F" | "M" | "O", birth: f.birth, heightCm: height, startWeight: wStore(start, "kg"), goalWeight: wStore(goal, "kg"),
        startDate: todayStr(), weightUnit: "kg", theme: "auto", waterGoalMl: 2000, cupMl: 250,
      },
      measures: [...s.measures, { id: uid(), date: todayStr(), weight: start, height }],
    }));
  };
  return (
    <div className="mx-auto max-w-md space-y-4 p-5">
      <div className="flex flex-col items-center gap-1 pt-4 text-center">
        <Logo size={96} />
        <h1 className="text-2xl font-bold">Minha Vida Menor</h1>
        <p className="font-medium text-[var(--em)]">Acompanhe, Cuide, Conquiste!</p>
      </div>
      <p className="text-center text-sm muted">Vamos começar. Seus dados ficam somente neste aparelho.</p>
      <Field label="Seu nome"><input className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sexo"><select className="inp" value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value })}><option value="F">Feminino</option><option value="M">Masculino</option><option value="O">Outro</option></select></Field>
        <Field label="Nascimento"><input type="date" className="inp" value={f.birth} onChange={(e) => setF({ ...f, birth: e.target.value })} /></Field>
        <Field label="Altura (cm)"><input className="inp" inputMode="decimal" value={f.height} onChange={(e) => setF({ ...f, height: e.target.value })} /></Field>
        <Field label="Peso inicial (kg)"><input className="inp" inputMode="decimal" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
      </div>
      <Field label="Meta de peso (kg)" hint="Defina uma meta realista, de preferência com seu médico ou nutricionista."><input className="inp" inputMode="decimal" value={f.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} /></Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald-600" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>Entendo que o aplicativo é apenas um diário de acompanhamento: não prescreve doses, não faz diagnóstico e não substitui o médico ou o nutricionista.</span>
      </label>
      <Btn variant="primary" className="w-full" onClick={save}>Começar</Btn>
    </div>
  );
}
