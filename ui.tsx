"use client";
import { useState, type ReactNode } from "react";
import { fmtDate, parseDate, pad, weekdaysShort, monthLabel, shiftMonth, todayStr } from "@/lib/utils";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="60 80 400 340" aria-label="Logotipo Minha Vida Menor">
      <circle cx="256" cy="126" r="34" fill="#059669" />
      <path d="M256 176C222 176 200 192 196 222L188 296C187 308 205 311 208 299L220 238L222 330L214 420C213 434 238 438 242 424L256 350L270 424C274 438 299 434 298 420L290 330L292 238L304 299C307 311 325 308 324 296L316 222C312 192 290 176 256 176Z" fill="#059669" />
      <ellipse cx="256" cy="272" rx="66" ry="17" fill="none" stroke="#facc15" strokeWidth="13" />
      <path d="M320 276C346 290 356 330 350 372" fill="none" stroke="#facc15" strokeWidth="13" strokeLinecap="round" />
      <path d="M256 236C234 220 230 203 243 199C250 197 256 202 256 207C256 202 262 197 269 199C282 203 278 220 256 236Z" fill="#f43f5e" />
    </svg>
  );
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`card ${className}`} onClick={onClick}>{children}</div>;
}

export function Btn({ children, onClick, variant = "default", className = "", type = "button", disabled }: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "primary" | "yellow" | "danger"; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const v = variant === "primary" ? "btn-primary" : variant === "yellow" ? "btn-yellow" : variant === "danger" ? "btn-danger" : "";
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn ${v} ${className}`}>{children}</button>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs muted">{hint}</span>}
    </label>
  );
}

export function Screen({ title, onBack, children, right }: { title: string; onBack?: () => void; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="btn no-print !min-h-10 !px-3" aria-label="Voltar">←</button>
        )}
        <h1 className="flex-1 text-xl font-bold">{title}</h1>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="sheet max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-[var(--bg)] p-4 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="btn !min-h-9 !px-3" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Progress({ value, max, color = "#10b981" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="soft p-5 text-center text-sm muted">{text}</div>;
}

export function Chips<T extends string>({ options, value, onChange, labels }: { options: T[]; value: T; onChange: (v: T) => void; labels?: Record<string, string> }) {
  return (
    <div className="scroll-x flex gap-2 pb-1">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={`chip ${o === value ? "chip-on" : ""}`}>{labels?.[o] ?? o}</button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-print scroll-x flex gap-1 rounded-2xl p-1" style={{ background: "var(--soft)" }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold ${o.id === value ? "bg-[var(--card)] shadow text-[var(--em)]" : "muted"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LineChart({ points, goal, unit = "", height = 170, color = "#059669", decimals = 1 }: {
  points: { label: string; value: number }[]; goal?: number; unit?: string; height?: number; color?: string; decimals?: number;
}) {
  if (points.length === 0) return <Empty text="Sem dados suficientes para o gráfico." />;
  const W = 320, H = height, px = 34, py = 18;
  const vals = points.map((p) => p.value).concat(goal !== undefined ? [goal] : []);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (max - min < 1) { max += 0.5; min -= 0.5; }
  const pad2 = (max - min) * 0.1; min -= pad2; max += pad2;
  const x = (i: number) => (points.length === 1 ? W / 2 : px + (i * (W - px - 10)) / (points.length - 1));
  const y = (v: number) => H - py - ((v - min) / (max - min)) * (H - py * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points.length - 1)} ${H - py} L${x(0)} ${H - py} Z`;
  const fmt = (v: number) => v.toFixed(decimals);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de linha">
      {[0, 0.5, 1].map((t) => {
        const v = min + (max - min) * t;
        return (
          <g key={t}>
            <line x1={px} x2={W - 6} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 3" />
            <text x={px - 4} y={y(v) + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{fmt(v)}</text>
          </g>
        );
      })}
      {goal !== undefined && (
        <g>
          <line x1={px} x2={W - 6} y1={y(goal)} y2={y(goal)} stroke="#facc15" strokeWidth="2" strokeDasharray="5 3" />
          <text x={W - 8} y={y(goal) - 3} fontSize="9" textAnchor="end" fill="#a16207">meta {fmt(goal)}{unit}</text>
        </g>
      )}
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r="3.5" fill="var(--card)" stroke={color} strokeWidth="2" />
      ))}
      <text x={x(0)} y={H - 3} fontSize="9" fill="var(--muted)" textAnchor={points.length === 1 ? "middle" : "start"}>{points[0].label}</text>
      {points.length > 1 && <text x={x(points.length - 1)} y={H - 3} fontSize="9" fill="var(--muted)" textAnchor="end">{points[points.length - 1].label}</text>}
    </svg>
  );
}

export function Bars({ data, goal, color = "#14b8a6", height = 130, unit = "" }: {
  data: { label: string; value: number }[]; goal?: number; color?: string; height?: number; unit?: string;
}) {
  const max = Math.max(1, goal ?? 0, ...data.map((d) => d.value));
  return (
    <div>
      <div className="relative flex items-end gap-1" style={{ height }}>
        {goal !== undefined && (
          <div className="absolute left-0 right-0 border-t-2 border-dashed" style={{ bottom: `${(goal / max) * 100}%`, borderColor: "#facc15" }} />
        )}
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${d.value}${unit}`}>
            <div className="rounded-t-md" style={{ height: `${(d.value / max) * 100}%`, background: color, minHeight: d.value > 0 ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 truncate text-center text-[9px] muted">{d.label}</div>
        ))}
      </div>
    </div>
  );
}

export function MonthGrid({ month, marks, selected, onSelect, onMonth }: {
  month: string; marks: Record<string, string[]>; selected?: string; onSelect?: (d: string) => void; onMonth?: (m: string) => void;
}) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(`${y}-${pad(m)}-${pad(d)}`);
  const today = todayStr();
  return (
    <div>
      {onMonth && (
        <div className="mb-2 flex items-center justify-between">
          <button className="btn !min-h-9 !px-3" onClick={() => onMonth(shiftMonth(month, -1))} aria-label="Mês anterior">‹</button>
          <b className="capitalize">{monthLabel(month)}</b>
          <button className="btn !min-h-9 !px-3" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="Próximo mês">›</button>
        </div>
      )}
      <div className="grid grid-cols-7 gap-1 text-center text-xs muted">
        {weekdaysShort.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c, i) =>
          c === null ? <div key={i} /> : (
            <button key={c} onClick={() => onSelect?.(c)}
              className="flex aspect-square flex-col items-center justify-center rounded-xl text-sm"
              style={{
                background: c === selected ? "var(--em)" : "var(--soft)",
                color: c === selected ? "#fff" : "var(--text)",
                outline: c === today ? "2px solid #facc15" : "none",
              }}>
              <span>{parseDate(c).getDate()}</span>
              <span className="flex h-1.5 gap-0.5">
                {(marks[c] || []).slice(0, 4).map((col, k) => (
                  <i key={k} className="block h-1.5 w-1.5 rounded-full" style={{ background: col }} />
                ))}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export function useToggle(init = false) {
  const [v, set] = useState(init);
  return [v, () => set(true), () => set(false)] as const;
}

export const ask = (msg: string) => typeof window !== "undefined" && window.confirm(msg);
export { fmtDate };

export type Nav = { go: (route: string) => void; back: () => void };
