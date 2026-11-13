"use client";
import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void> };

export default function InstallButton() {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const h = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setMsg("✅ Aplicativo instalado! Procure “Minha Vida Menor” na sua lista de aplicativos."));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  return (
    <div className="w-full space-y-2">
      <button
        className="btn btn-primary w-full !min-h-16 text-lg"
        onClick={() => {
          if (bip) { bip.prompt(); setBip(null); }
          else setMsg("No Chrome, toque no menu ⋮ e escolha “Instalar aplicativo” (ou “Adicionar à tela inicial”).");
        }}
      >
        📲 INSTALAR APLICATIVO ANDROID
      </button>
      {msg && <p className="soft p-3 text-sm">{msg}</p>}
    </div>
  );
}
