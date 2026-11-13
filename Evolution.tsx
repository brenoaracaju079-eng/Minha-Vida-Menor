"use client";
import { useState } from "react";
import { useApp, upsert, remove, patchProfile, type Measure } from "@/lib/store";
import { todayStr, brDate, bmi, bmiClass, f1, num, wShow, wStore, wFmt, parseDate, fmtDate, shortDate, uid } from "@/lib/utils";
import { currentWeight } from "@/lib/calc";
import { Btn, Card, Chips, Empty, Field, LineChart, Modal, Progress, Screen, Tabs, ask, type Nav } from "./ui";

type MetricKey = "weight" | "waist" | "abdomen" | "hip" | "arm" | "thigh" | "bodyFat";
const metrics: Record<MetricKey, string> = { weight: "Peso", waist: "Cintura", abdomen: "Abdômen", hip: "Quadril", arm: "Braços", thigh: "Coxas", bodyFat: "% Gordura" };

function weekStart(d: string) {
  const dt = parseDate(d);
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
  return fmtDate(dt);
}

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 560;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Evolution({ back }: Nav) {
  const s = useApp();
  const p = s.profile!;
  const unit = p.weightUnit;
  const [tab, setTab] = useState<"med" | "graf" | "foto">("med");
  const [metric, setMetric] = useState<MetricKey>("weight");
  const [period, setPeriod] = useState<"semanal" | "mensal" | "anual">("semanal");
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [view, setView] = useState<string | null>(null);

  const cur = currentWeight(s);
  const b = bmi(cur, p.heightCm);
  const lost = p.startWeight - cur;
  const total = p.startWeight - p.goalWeight;
  const sorted = [...s.measures].sort((a, b2) => b2.date.localeCompare(a.date));

  const openForm = (m?: Measure) => {
    const v = (n?: number, w?: boolean) => (n === undefined ? "" : String(w ? Math.round(wShow(n, unit) * 10) / 10 : n));
    setForm({
      id: m?.id || "", date: m?.date || todayStr(), weight: v(m?.weight, true), height: v(m?.height ?? (m ? undefined : p.heightCm)),
      waist: v(m?.waist), abdomen: v(m?.abdomen), hip: v(m?.hip), arm: v(m?.arm), thigh: v(m?.thigh), bodyFat: v(m?.bodyFat),
    });
  };
  const save = () => {
    if (!form) return;
    const w = num(form.weight);
    const m: Measure = {
      id: form.id, date: form.date, weight: w === undefined ? undefined : wStore(w, unit), height: num(form.height),
      waist: num(form.waist), abdomen: num(form.abdomen), hip: num(form.hip), arm: num(form.arm), thigh: num(form.thigh), bodyFat: num(form.bodyFat),
    };
    if (Object.entries(m).filter(([k, v]) => k !== "id" && k !== "date" && v !== undefined).length === 0) return alert("Preencha ao menos uma medida.");
    upsert("measures", m);
    if (m.height) patchProfile({ heightCm: m.height });
    setForm(null);
  };

  // Gráficos
  const series = s.measures
    .filter((m) => m[metric] !== undefined)
    .sort((a, b2) => a.date.localeCompare(b2.date));
  const buckets = new Map<string, number>();
  series.forEach((m) => {
    const k = period === "semanal" ? weekStart(m.date) : period === "mensal" ? m.date.slice(0, 7) : m.date.slice(0, 4);
    buckets.set(k, m[metric] as number);
  });
  const limit = period === "semanal" ? 12 : period === "mensal" ? 12 : 10;
  const points = Array.from(buckets.entries()).slice(-limit).map(([k, v]) => ({
    label: period === "semanal" ? shortDate(k) : period === "mensal" ? `${k.slice(5)}/${k.slice(2, 4)}` : k,
    value: metric === "weight" ? wShow(v, unit) : v,
  }));
  const uMetric = metric === "weight" ? unit : metric === "bodyFat" ? "%" : "cm";

  const addPhoto = async (file?: File) => {
    if (!file) return;
    try {
      const data = await compress(file);
      upsert("photos", { id: uid(), date: todayStr(), data, note: "" });
    } catch { alert("Não foi possível carregar a imagem."); }
  };
  const photos = [...s.photos].sort((a, b2) => a.date.localeCompare(b2.date));

  const F = (k: string, label: string, ph?: string) => (
    <Field label={label}><input className="inp" inputMode="decimal" placeholder={ph} value={form?.[k] || ""} onChange={(e) => setForm({ ...form!, [k]: e.target.value })} /></Field>
  );

  return (
    <Screen title="Evolução corporal" onBack={back} right={<Btn variant="primary" onClick={() => openForm()}>+ Medidas</Btn>}>
      <Card className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="soft p-2"><div className="text-xs muted">Peso atual</div><div className="font-bold">{wFmt(cur, unit)}</div></div>
          <div className="soft p-2"><div className="text-xs muted">IMC</div><div className="font-bold">{f1(b)}</div><div className="text-[10px] muted">{bmiClass(b)}</div></div>
          <div className="soft p-2"><div className="text-xs muted">Início → hoje</div><div className="font-bold">{lost >= 0 ? "−" : "+"}{wFmt(Math.abs(lost), unit)}</div></div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm"><span>Progresso até a meta ({wFmt(p.goalWeight, unit)})</span><b>{total > 0 ? Math.max(0, Math.min(100, Math.round((lost / total) * 100))) : 0}%</b></div>
          <Progress value={lost} max={total} />
        </div>
        <p className="text-xs muted">O IMC é apenas uma referência e não considera massa muscular. Metas e ritmo de perda devem ser definidos com seus profissionais de saúde.</p>
      </Card>

      <Tabs value={tab} onChange={setTab} options={[{ id: "med", label: "Registros" }, { id: "graf", label: "Gráficos" }, { id: "foto", label: "Fotos" }]} />

      {tab === "graf" && (
        <Card className="space-y-3">
          <Chips options={Object.keys(metrics) as MetricKey[]} value={metric} onChange={setMetric} labels={metrics} />
          <Chips options={["semanal", "mensal", "anual"] as const} value={period} onChange={setPeriod} labels={{ semanal: "Semanal", mensal: "Mensal", anual: "Anual" }} />
          <LineChart points={points} unit={metric === "weight" ? ` ${unit}` : ""} goal={metric === "weight" ? wShow(p.goalWeight, unit) : undefined} />
          <p className="text-xs muted">{uMetric} • {period === "semanal" ? "últimas 12 semanas" : period === "mensal" ? "últimos 12 meses" : "por ano"} (último registro de cada período)</p>
        </Card>
      )}

      {tab === "med" && (
        <>
          {sorted.length === 0 && <Empty text="Nenhum registro ainda." />}
          {sorted.map((m) => (
            <Card key={m.id} className="space-y-1">
              <div className="flex items-center justify-between"><b>{brDate(m.date)}</b><span className="font-bold text-[var(--em)]">{m.weight !== undefined && wFmt(m.weight, unit)}</span></div>
              <div className="flex flex-wrap gap-x-4 text-sm muted">
                {m.waist !== undefined && <span>Cintura {m.waist} cm</span>}{m.abdomen !== undefined && <span>Abdômen {m.abdomen} cm</span>}
                {m.hip !== undefined && <span>Quadril {m.hip} cm</span>}{m.arm !== undefined && <span>Braços {m.arm} cm</span>}
                {m.thigh !== undefined && <span>Coxas {m.thigh} cm</span>}{m.bodyFat !== undefined && <span>Gordura {m.bodyFat}%</span>}
                {m.weight !== undefined && <span>IMC {f1(bmi(m.weight, m.height || p.heightCm))}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                <Btn className="!min-h-9" onClick={() => openForm(m)}>Editar</Btn>
                <Btn className="!min-h-9" variant="danger" onClick={() => ask("Excluir este registro?") && remove("measures", m.id)}>Excluir</Btn>
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "foto" && (
        <div className="space-y-3">
          <div className="soft p-3 text-sm">🔒 Suas fotos ficam apenas neste aparelho. Proteja o app com senha ou biometria em Perfil.</div>
          <label className="btn btn-primary w-full cursor-pointer">📷 Adicionar foto
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { addPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {photos.length >= 2 && (
            <Card>
              <h3 className="mb-2 font-bold">Antes e depois</h3>
              <div className="grid grid-cols-2 gap-2">
                {[photos[0], photos[photos.length - 1]].map((ph) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div key={ph.id}><img src={ph.data} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" /><div className="mt-1 text-center text-xs muted">{brDate(ph.date)}</div></div>
                ))}
              </div>
            </Card>
          )}
          {photos.length === 0 && <Empty text="Nenhuma foto adicionada." />}
          <div className="grid grid-cols-3 gap-2">
            {[...photos].reverse().map((ph) => (
              // eslint-disable-next-line @next/next/no-img-element
              <button key={ph.id} onClick={() => setView(ph.id)}><img src={ph.data} alt="" className="aspect-square w-full rounded-xl object-cover" /><div className="text-[10px] muted">{brDate(ph.date)}</div></button>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Foto de evolução">
        {view && (() => {
          const ph = s.photos.find((x) => x.id === view);
          if (!ph) return null;
          return (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.data} alt="" className="w-full rounded-2xl" />
              <input className="inp" placeholder="Anotação" defaultValue={ph.note} onBlur={(e) => upsert("photos", { ...ph, note: e.target.value })} />
              <div className="text-sm muted">{brDate(ph.date)}</div>
              <Btn variant="danger" className="w-full" onClick={() => { if (ask("Excluir esta foto?")) { remove("photos", ph.id); setView(null); } }}>Excluir foto</Btn>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Editar medidas" : "Registrar medidas"}>
        {form && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <Field label="Data"><input type="date" className="inp" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              {F("weight", `Peso (${unit})`)}{F("height", "Altura (cm)")}
              {F("waist", "Cintura (cm)")}{F("abdomen", "Abdômen (cm)")}
              {F("hip", "Quadril (cm)")}{F("arm", "Braços (cm)")}
              {F("thigh", "Coxas (cm)")}{F("bodyFat", "% de gordura", "se souber")}
            </div>
            <Btn type="submit" variant="primary" className="w-full">Salvar</Btn>
          </form>
        )}
      </Modal>
    </Screen>
  );
}
