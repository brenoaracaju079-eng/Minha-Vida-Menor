"use client";
import { useState } from "react";
import { articles, SOURCES } from "@/lib/knowledge";
import { Card, Screen, type Nav } from "./ui";

export default function Knowledge({ back }: Nav) {
  const [open, setOpen] = useState<string | null>(null);
  const a = articles.find((x) => x.id === open);
  if (a) {
    return (
      <Screen title={a.title} onBack={() => setOpen(null)}>
        <div className="space-y-3">
          {a.sections.map((s) => (
            <Card key={s.h}><h3 className="mb-1 font-bold text-[var(--em)]">{s.h}</h3><p className="text-sm leading-relaxed">{s.t}</p></Card>
          ))}
          <p className="text-xs muted">{SOURCES}</p>
        </div>
      </Screen>
    );
  }
  return (
    <Screen title="Central de Conhecimento" onBack={back}>
      <p className="text-sm muted">Conteúdo educativo sobre tirzepatida e emagrecimento saudável. Consulte sempre a bula e seu médico.</p>
      <div className="grid gap-2">
        {articles.map((x) => (
          <button key={x.id} className="card flex items-center gap-3 text-left" onClick={() => setOpen(x.id)}>
            <span className="text-3xl">{x.icon}</span>
            <span className="flex-1"><b className="block">{x.title}</b><span className="text-sm muted">{x.summary}</span></span>
            <span>›</span>
          </button>
        ))}
      </div>
      <p className="text-xs muted">{SOURCES}</p>
    </Screen>
  );
}
