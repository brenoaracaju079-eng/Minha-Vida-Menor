"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp, loadState, getState } from "@/lib/store";
import { checkReminders } from "@/lib/notify";
import { Logo, Modal } from "./ui";
import Home from "./Home";
import Applications from "./Applications";
import Meds from "./Meds";
import Food from "./Food";
import Evolution from "./Evolution";
import Profile, { MenuGrid } from "./Profile";
import { Water, Activities, Symptoms, Diary } from "./Tracking";
import Calendar from "./Calendar";
import Report from "./Report";
import Knowledge from "./Knowledge";
import { LockScreen, Onboarding } from "./Lock";

type BIPEvent = Event & { prompt: () => Promise<void> };
const tabs: [string, string, string][] = [
  ["home", "🏠", "Início"], ["apps", "💉", "Aplicações"], ["food", "🍽️", "Alimentação"], ["evo", "📈", "Evolução"], ["profile", "👤", "Perfil"],
];

export default function App() {
  const s = useApp();
  const [route, setRoute] = useState("home");
  const [unlocked, setUnlocked] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const hiddenAt = useRef(0);

  useEffect(() => {
    loadState();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {});
    const pop = (e: PopStateEvent) => setRoute(e.state?.r ?? "home");
    const beforeInstall = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent); };
    window.addEventListener("popstate", pop);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    const vis = () => {
      if (document.hidden) hiddenAt.current = Date.now();
      else {
        if (hiddenAt.current && Date.now() - hiddenAt.current > 60000 && getState().profile?.pinHash) setUnlocked(false);
        checkReminders(getState());
      }
    };
    document.addEventListener("visibilitychange", vis);
    const t = setInterval(() => checkReminders(getState()), 30000);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      document.removeEventListener("visibilitychange", vis);
      clearInterval(t);
    };
  }, []);

  const theme = s.profile?.theme;
  useEffect(() => {
    const apply = () => {
      const dark = theme === "escuro" || (theme !== "claro" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const go = useCallback((r: string) => {
    window.history.pushState({ r }, "");
    setRoute(r);
    setMenu(false);
    window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => {
    if (window.history.state?.r) window.history.back();
    else setRoute("home");
  }, []);

  if (!s.loaded) {
    return <div className="flex min-h-screen items-center justify-center"><Logo size={90} /></div>;
  }
  if (!s.profile) return <Onboarding />;
  if (s.profile.pinHash && !unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const nav = { go, back };
  const installFn = bip && !window.matchMedia("(display-mode: standalone)").matches ? () => { bip.prompt(); setBip(null); } : undefined;
  const screens: Record<string, React.ReactNode> = {
    home: <Home {...nav} installPrompt={installFn} />,
    apps: <Applications {...nav} />,
    food: <Food {...nav} />,
    evo: <Evolution {...nav} />,
    profile: <Profile {...nav} />,
    meds: <Meds {...nav} />,
    water: <Water {...nav} />,
    activity: <Activities {...nav} />,
    symptoms: <Symptoms {...nav} />,
    diary: <Diary {...nav} />,
    report: <Report {...nav} />,
    calendar: <Calendar {...nav} />,
    knowledge: <Knowledge {...nav} />,
  };

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b backdrop-blur" style={{ background: "color-mix(in srgb, var(--bg) 90%, transparent)", borderColor: "var(--line)" }}>
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-2">
          <Logo size={30} />
          <span className="flex-1 font-bold text-[var(--em)]">Minha Vida Menor</span>
          <button className="btn !min-h-9 !px-3" onClick={() => setMenu(true)} aria-label="Menu">☰ Menu</button>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-28 pt-4">{screens[route] ?? screens.home}</main>
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 border-t" style={{ background: "var(--card)", borderColor: "var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-xl">
          {tabs.map(([r, i, l]) => (
            <button key={r} onClick={() => go(r)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium" style={{ color: route === r ? "var(--em)" : "var(--muted)" }}>
              <span className={`rounded-full px-4 py-0.5 text-xl ${route === r ? "bg-[var(--soft)]" : ""}`}>{i}</span>{l}
            </button>
          ))}
        </div>
      </nav>
      <Modal open={menu} onClose={() => setMenu(false)} title="Menu">
        <div className="space-y-3">
          <MenuGrid go={go} />
          <p className="text-center text-xs muted">Acompanhe, Cuide, Conquiste!</p>
        </div>
      </Modal>
    </>
  );
}
