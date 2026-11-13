"use client";
import { useState } from "react";
import { useApp, patchProfile, patchNotif, exportJson, importJson, wipeAll, type Profile as P } from "@/lib/store";
import { num, wShow, wStore, sha256, download, todayStr, weekdays } from "@/lib/utils";
import { bioSupported, registerBiometric } from "@/lib/security";
import { askPermission, notify } from "@/lib/notify";
import { Btn, Card, Field, Screen, Tabs, ask, type Nav } from "./ui";

const menu: [string, string, string][] = [
  ["💊", "Medicamentos", "meds"], ["💧", "Hidratação", "water"], ["🏃", "Atividades", "activity"], ["🩺", "Sintomas", "symptoms"],
  ["📓", "Diário e conquistas", "diary"], ["📄", "Relatório do mês", "report"], ["📅", "Calendário", "calendar"], ["📚", "Conhecimento", "knowledge"],
];
export const MenuGrid = ({ go }: { go: (r: string) => void }) => (
  <div className="grid grid-cols-2 gap-2">
    {menu.map(([i, l, r]) => <button key={r} className="card flex items-center gap-2 !p-3 text-left" onClick={() => go(r)}><span className="text-2xl">{i}</span><b className="text-sm">{l}</b></button>)}
  </div>
);

export default function Profile({ go, back }: Nav) {
  const s = useApp();
  const p = s.profile!;
  const n = s.notif;
  const unit = p.weightUnit;
  const [tab, setTab] = useState<"perfil" | "notif" | "seg" | "dados" | "ajuda">("perfil");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const setP = (x: Partial<P>) => patchProfile(x);

  const savePin = async () => {
    if (!/^\d{4,6}$/.test(pin)) return setMsg("Use 4 a 6 números.");
    patchProfile({ pinHash: await sha256(pin) });
    setPin(""); setMsg("Senha ativada. O app será bloqueado ao abrir.");
  };
  const toggleNotif = async (on: boolean) => {
    if (on) {
      const ok = await askPermission();
      if (!ok) return alert("Permissão negada. Ative as notificações nas configurações do aparelho para este app.");
      patchNotif({ enabled: true });
      notify("Notificações ativadas", "Você receberá lembretes do Minha Vida Menor.");
    } else patchNotif({ enabled: false });
  };
  const T = ({ k, label }: { k: keyof typeof n; label: string }) => (
    <label className="flex items-center justify-between py-1.5 text-sm">{label}
      <input type="checkbox" className="h-5 w-5 accent-emerald-600" checked={n[k] as boolean} onChange={(e) => patchNotif({ [k]: e.target.checked })} />
    </label>
  );

  return (
    <Screen title="Perfil e configurações" onBack={back}>
      <MenuGrid go={go} />
      <Tabs value={tab} onChange={setTab} options={[{ id: "perfil", label: "Perfil" }, { id: "notif", label: "Alertas" }, { id: "seg", label: "Segurança" }, { id: "dados", label: "Dados" }, { id: "ajuda", label: "Ajuda" }]} />

      {tab === "perfil" && (
        <Card className="space-y-3">
          <Field label="Nome"><input className="inp" defaultValue={p.name} onBlur={(e) => setP({ name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sexo"><select className="inp" value={p.sex} onChange={(e) => setP({ sex: e.target.value as P["sex"] })}><option value="F">Feminino</option><option value="M">Masculino</option><option value="O">Outro</option></select></Field>
            <Field label="Nascimento"><input type="date" className="inp" value={p.birth} onChange={(e) => setP({ birth: e.target.value })} /></Field>
            <Field label="Altura (cm)"><input className="inp" inputMode="decimal" defaultValue={p.heightCm} onBlur={(e) => { const v = num(e.target.value); if (v) setP({ heightCm: v }); }} /></Field>
            <Field label={`Peso inicial (${unit})`}><input key={unit} className="inp" inputMode="decimal" defaultValue={Math.round(wShow(p.startWeight, unit) * 10) / 10} onBlur={(e) => { const v = num(e.target.value); if (v) setP({ startWeight: wStore(v, unit) }); }} /></Field>
            <Field label={`Meta de peso (${unit})`}><input key={unit + "g"} className="inp" inputMode="decimal" defaultValue={Math.round(wShow(p.goalWeight, unit) * 10) / 10} onBlur={(e) => { const v = num(e.target.value); if (v) setP({ goalWeight: wStore(v, unit) }); }} /></Field>
            <Field label="Unidade de peso"><select className="inp" value={unit} onChange={(e) => setP({ weightUnit: e.target.value as "kg" | "lb" })}><option value="kg">Quilogramas (kg)</option><option value="lb">Libras (lb)</option></select></Field>
          </div>
          <Field label="Tema"><select className="inp" value={p.theme} onChange={(e) => setP({ theme: e.target.value as P["theme"] })}><option value="auto">Automático (sistema)</option><option value="claro">Claro</option><option value="escuro">Escuro</option></select></Field>
          <p className="text-xs muted">Medicamentos são gerenciados em “Medicamentos”. Altura em centímetros e volumes em mL.</p>
          <Btn className="w-full" onClick={() => go("meds")}>💊 Gerenciar medicamentos</Btn>
        </Card>
      )}

      {tab === "notif" && (
        <Card className="space-y-2">
          <label className="flex items-center justify-between font-bold">Ativar notificações
            <input type="checkbox" className="h-6 w-6 accent-emerald-600" checked={n.enabled} onChange={(e) => toggleNotif(e.target.checked)} />
          </label>
          <T k="injection" label="💉 Dia da aplicação (e véspera)" />
          <T k="water" label="💧 Beber água" />
          <label className="flex items-center justify-between py-1.5 text-sm">Intervalo da água
            <select className="inp !w-auto !min-h-9 !py-1" value={n.waterEveryH} onChange={(e) => patchNotif({ waterEveryH: Number(e.target.value) })}>{[1, 2, 3, 4].map((h) => <option key={h} value={h}>a cada {h} h</option>)}</select>
          </label>
          <T k="weigh" label="⚖️ Pesagem semanal" />
          <div className="grid grid-cols-2 gap-2">
            <select className="inp" value={n.weighDay} onChange={(e) => patchNotif({ weighDay: Number(e.target.value) })}>{weekdays.map((w, i) => <option key={i} value={i}>{w}</option>)}</select>
            <input type="time" className="inp" value={n.weighTime} onChange={(e) => patchNotif({ weighTime: e.target.value })} />
          </div>
          <T k="measures" label="📏 Medidas e relatório (dia 1º do mês)" />
          <T k="activity" label="🏃 Atividade física" />
          <input type="time" className="inp" value={n.activityTime} onChange={(e) => patchNotif({ activityTime: e.target.value })} />
          <T k="events" label="🩺 Consultas e exames" />
          <Btn className="w-full" onClick={() => notify("Teste de notificação", "Tudo certo! Os lembretes estão funcionando.")}>Enviar notificação de teste</Btn>
          <p className="text-xs muted">Os lembretes são locais (sem internet). Funcionam enquanto o app estiver instalado e aberto ou em segundo plano. Se o Android encerrar o app, os alertas voltam quando você abri-lo novamente. Para melhor funcionamento, permita notificações e desative a economia de bateria para este app.</p>
        </Card>
      )}

      {tab === "seg" && (
        <Card className="space-y-3">
          <p className="text-sm">{p.pinHash ? "🔒 Proteção por senha ativada." : "Proteja seus dados de saúde com senha numérica."}</p>
          <Field label={p.pinHash ? "Nova senha (4 a 6 números)" : "Criar senha (4 a 6 números)"}><input className="inp" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} /></Field>
          <Btn variant="primary" className="w-full" onClick={savePin}>{p.pinHash ? "Alterar senha" : "Ativar senha"}</Btn>
          {msg && <p className="text-sm text-[var(--em)]">{msg}</p>}
          {p.pinHash && (
            <>
              {bioSupported() && (
                <Btn className="w-full" onClick={async () => {
                  if (p.bioCredId) { patchProfile({ bioCredId: undefined }); return setMsg("Biometria desativada."); }
                  try { patchProfile({ bioCredId: await registerBiometric() }); setMsg("Biometria ativada."); } catch { setMsg("Não foi possível ativar a biometria neste aparelho."); }
                }}>{p.bioCredId ? "Desativar biometria" : "👆 Ativar biometria / bloqueio de tela"}</Btn>
              )}
              <Btn variant="danger" className="w-full" onClick={() => ask("Remover a proteção por senha?") && patchProfile({ pinHash: undefined, bioCredId: undefined })}>Remover senha</Btn>
            </>
          )}
          <p className="text-xs muted">Os dados ficam armazenados somente no seu aparelho e nunca são enviados a servidores. Se esquecer a senha, será necessário limpar os dados do aplicativo (restaure um backup depois).</p>
        </Card>
      )}

      {tab === "dados" && (
        <Card className="space-y-3">
          <Btn variant="primary" className="w-full" onClick={() => download(`minha-vida-menor-backup-${todayStr()}.json`, exportJson())}>⬇️ Fazer backup / exportar dados</Btn>
          <label className="btn w-full cursor-pointer">⬆️ Restaurar backup
            <input type="file" accept=".json,application/json" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              if (!ask("Restaurar substituirá os dados atuais. Continuar?")) return;
              try { importJson(await f.text()); alert("Backup restaurado."); } catch { alert("Arquivo de backup inválido."); }
              e.target.value = "";
            }} />
          </label>
          <Btn variant="danger" className="w-full" onClick={() => { if (ask("Excluir TODOS os dados deste aparelho? Esta ação não pode ser desfeita.") && ask("Tem certeza? Faça um backup antes se quiser guardar seus registros.")) wipeAll(); }}>🗑 Excluir todos os meus dados</Btn>
          <p className="text-xs muted">O backup é um arquivo seu: guarde em local seguro, pois contém informações de saúde.</p>
        </Card>
      )}

      {tab === "ajuda" && (
        <div className="space-y-3">
          <Card className="space-y-2 text-sm">
            <h3 className="text-base font-bold">Manual rápido</h3>
            <p><b>1. Início:</b> resumo do peso, IMC, água, próxima aplicação e gráfico.</p>
            <p><b>2. Medicamentos:</b> cadastre exatamente o que foi prescrito (nome, dose, frequência, horário).</p>
            <p><b>3. Aplicações:</b> toque na região do mapa corporal para registrar. As cores mostram o que foi usado recentemente.</p>
            <p><b>4. Alimentação:</b> receitas, “Substituir”, “O que tenho na geladeira?”, lista de compras e favoritos.</p>
            <p><b>5. Evolução:</b> registre peso e medidas, veja gráficos semanais, mensais e anuais, e guarde fotos privadas.</p>
            <p><b>6. Relatório:</b> em Perfil → Relatório do mês. Use “Exportar PDF” para levar ao médico.</p>
            <p><b>7. Lembretes:</b> ative em Alertas. Salve o backup com frequência.</p>
          </Card>
          <Card className="space-y-1 text-sm">
            <h3 className="text-base font-bold">Sobre</h3>
            <p>Minha Vida Menor – Acompanhe, Cuide, Conquiste! Gratuito, sem anúncios e sem assinaturas.</p>
            <p className="muted">Este aplicativo é um diário de acompanhamento. Não prescreve doses, não faz diagnóstico e não substitui orientação médica ou nutricional. Siga sempre a bula e a prescrição.</p>
          </Card>
        </div>
      )}
    </Screen>
  );
}
