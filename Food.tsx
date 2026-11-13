"use client";
import { useMemo, useState } from "react";
import { useApp, toggleFav, upsert, remove, setState } from "@/lib/store";
import { recipes, catNames, fridge, foods, foodGroups, type Cat, type Recipe, type Food } from "@/lib/recipes";
import { uid } from "@/lib/utils";
import { Btn, Card, Chips, Empty, Modal, Screen, Tabs, type Nav } from "./ui";

const grads = ["#10b981,#0d9488", "#14b8a6,#0ea5e9", "#84cc16,#10b981", "#f59e0b,#f97316", "#06b6d4,#10b981", "#22c55e,#14b8a6"];
const hash = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

function Tile({ r, big }: { r: Recipe; big?: boolean }) {
  const g = grads[hash(r.id) % grads.length].split(",");
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-2xl ${big ? "h-36 w-full text-7xl" : "h-16 w-16 text-3xl"}`}
      style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }} aria-hidden>
      {r.emoji}
    </div>
  );
}

function Macros({ n }: { n: { kcal: number; p: number; c: number; g: number; f: number } }) {
  const items = [["Calorias", `${n.kcal} kcal`], ["Proteínas", `${n.p} g`], ["Carboidr.", `${n.c} g`], ["Gorduras", `${n.g} g`], ["Fibras", `${n.f} g`]];
  return (
    <div className="grid grid-cols-5 gap-1 text-center">
      {items.map(([l, v]) => (
        <div key={l} className="soft p-1.5"><div className="text-[10px] muted">{l}</div><div className="text-xs font-bold">{v}</div></div>
      ))}
    </div>
  );
}

function addToShopping(r: Recipe) {
  setState((s) => {
    const have = new Set(s.shopping.map((i) => i.name.toLowerCase()));
    const add = r.ing.filter((i) => !have.has(i.toLowerCase())).map((name) => ({ id: uid(), name, done: false }));
    return { ...s, shopping: [...s.shopping, ...add] };
  });
}

function RecipeDetail({ r, onClose }: { r: Recipe | null; onClose: () => void }) {
  const s = useApp();
  if (!r) return null;
  const fav = s.favorites.includes(r.id);
  return (
    <Modal open onClose={onClose} title={r.nome}>
      <div className="space-y-3">
        <Tile r={r} big />
        <p className="text-center text-xs muted">Imagem ilustrativa</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="chip">⏱ {r.tempo} min</span><span className="chip">🍽 {r.porcoes} porç{r.porcoes > 1 ? "ões" : "ão"}</span>
          {r.cats.map((c) => <span key={c} className="chip">{catNames[c]}</span>)}
        </div>
        <div><div className="mb-1 text-sm font-semibold">Informação nutricional por porção (estimada)</div><Macros n={r} /></div>
        <div><h3 className="font-bold">Ingredientes</h3><ul className="ml-5 list-disc text-sm">{r.ing.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div><h3 className="font-bold">Modo de preparo</h3><ol className="ml-5 list-decimal space-y-1 text-sm">{r.preparo.map((i) => <li key={i}>{i}</li>)}</ol></div>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={() => toggleFav(r.id)}>{fav ? "★ Favorita" : "☆ Favoritar"}</Btn>
          <Btn variant="primary" className="flex-1" onClick={() => { addToShopping(r); alert("Ingredientes adicionados à lista de compras."); }}>🛒 À lista</Btn>
        </div>
        <p className="text-xs muted">Valores aproximados. Ajuste porções conforme orientação do seu nutricionista.</p>
      </div>
    </Modal>
  );
}

function RecipeRow({ r, onOpen, extra }: { r: Recipe; onOpen: () => void; extra?: string }) {
  const s = useApp();
  return (
    <div className="card flex cursor-pointer items-center gap-3 !p-2" onClick={onOpen}>
      <Tile r={r} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{r.nome}</div>
        <div className="text-xs muted">⏱ {r.tempo} min • {r.kcal} kcal • P {r.p} g</div>
        {extra && <div className="text-xs font-medium text-[var(--em)]">{extra}</div>}
      </div>
      <button className="text-xl" aria-label="Favoritar" onClick={(e) => { e.stopPropagation(); toggleFav(r.id); }}>{s.favorites.includes(r.id) ? "★" : "☆"}</button>
    </div>
  );
}

function Library() {
  const [cat, setCat] = useState<Cat | "todas">("todas");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Recipe | null>(null);
  const list = recipes.filter((r) => (cat === "todas" || r.cats.includes(cat)) && r.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <input className="inp" placeholder="Buscar receita..." value={q} onChange={(e) => setQ(e.target.value)} />
      <Chips options={["todas", ...(Object.keys(catNames) as Cat[])] as (Cat | "todas")[]} value={cat} onChange={setCat} labels={{ todas: "Todas", ...catNames }} />
      {list.length === 0 && <Empty text="Nenhuma receita encontrada." />}
      {list.map((r) => <RecipeRow key={r.id} r={r} onOpen={() => setOpen(r)} />)}
      <RecipeDetail r={open} onClose={() => setOpen(null)} />
    </div>
  );
}

const diff = (a: number, b: number, unit = "") => {
  const d = Math.round((b - a) * 10) / 10;
  return <span className={d === 0 ? "muted" : d > 0 ? "text-amber-600" : "text-emerald-600"}>{d > 0 ? "+" : ""}{d}{unit}</span>;
};

function Substitute() {
  const s = useApp();
  const [mode, setMode] = useState<"alimento" | "refeicao">("alimento");
  const [group, setGroup] = useState("Carboidratos");
  const [foodId, setFoodId] = useState("f1");
  const [recId, setRecId] = useState("r8");
  const [open, setOpen] = useState<Recipe | null>(null);
  const food = foods.find((f) => f.id === foodId) as Food;
  const main = (g: string) => (g === "Proteínas" || g === "Leguminosas" ? "p" : g === "Gorduras boas" ? "g" : g === "Vegetais" ? "f" : "c") as "p" | "g" | "f" | "c";
  const alts = foods
    .filter((f) => f.grupo === food.grupo && f.id !== food.id)
    .map((f) => ({ f, score: Math.abs(f.kcal - food.kcal) + 4 * Math.abs(f[main(food.grupo)] - food[main(food.grupo)]) }))
    .sort((a, b) => a.score - b.score).slice(0, 6).map((x) => x.f);
  const rec = recipes.find((r) => r.id === recId) as Recipe;
  const mealCats: Cat[] = ["cafe", "almoco", "jantar", "lanche", "sobremesa"];
  const recAlts = recipes
    .filter((r) => r.id !== rec.id && r.cats.some((c) => mealCats.includes(c) && rec.cats.includes(c)))
    .map((r) => ({ r, score: Math.abs(r.kcal - rec.kcal) + 3 * Math.abs(r.p - rec.p) + Math.abs(r.c - rec.c) * 0.5 }))
    .sort((a, b) => a.score - b.score).slice(0, 5).map((x) => x.r);

  const Row = ({ label, n, base, fav, onFav }: { label: string; n: Food | Recipe; base?: Food | Recipe; fav?: boolean; onFav?: () => void }) => (
    <tr className={base ? "" : "font-bold"} style={base ? undefined : { background: "var(--soft)" }}>
      <td className="py-1.5 pr-1 text-left text-xs">{label}{onFav && <button className="ml-1" onClick={onFav}>{fav ? "★" : "☆"}</button>}</td>
      {(["kcal", "p", "c", "g", "f"] as const).map((k) => (
        <td key={k} className="text-center text-xs">{n[k]}{base && <div className="text-[10px]">{diff(base[k], n[k])}</div>}</td>
      ))}
    </tr>
  );
  const Head = () => (
    <thead><tr className="text-[10px] muted"><th className="text-left">Alimento</th><th>kcal</th><th>Prot.</th><th>Carb.</th><th>Gord.</th><th>Fibras</th></tr></thead>
  );

  return (
    <div className="space-y-3">
      <Tabs value={mode} onChange={setMode} options={[{ id: "alimento", label: "Alimento" }, { id: "refeicao", label: "Refeição completa" }]} />
      {mode === "alimento" ? (
        <>
          <p className="text-sm muted">Escolha um alimento e veja alternativas do mesmo grupo com composição nutricional próxima.</p>
          <Chips options={foodGroups} value={group} onChange={(g) => { setGroup(g); setFoodId(foods.find((f) => f.grupo === g)!.id); }} />
          <select className="inp" value={foodId} onChange={(e) => setFoodId(e.target.value)}>
            {foods.filter((f) => f.grupo === group).map((f) => <option key={f.id} value={f.id}>{f.nome} ({f.porcao})</option>)}
          </select>
          <Card>
            <h3 className="mb-1 font-bold">Alternativas para {food.nome}</h3>
            <p className="mb-2 text-xs muted">Valores por porção indicada. Diferenças em relação ao alimento escolhido.</p>
            <table className="w-full"><Head /><tbody>
              <Row label={`${food.nome} (${food.porcao})`} n={food} fav={s.favorites.includes(food.id)} onFav={() => toggleFav(food.id)} />
              {alts.map((a) => <Row key={a.id} label={`${a.nome} (${a.porcao})`} n={a} base={food} fav={s.favorites.includes(a.id)} onFav={() => toggleFav(a.id)} />)}
            </tbody></table>
          </Card>
        </>
      ) : (
        <>
          <p className="text-sm muted">Escolha uma refeição e veja outras com composição nutricional semelhante.</p>
          <select className="inp" value={recId} onChange={(e) => setRecId(e.target.value)}>
            {recipes.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
          <Card>
            <h3 className="mb-2 font-bold">Refeições semelhantes</h3>
            <table className="w-full"><Head /><tbody>
              <Row label={rec.nome} n={rec} />
              {recAlts.map((a) => <Row key={a.id} label={a.nome} n={a} base={rec} />)}
            </tbody></table>
          </Card>
          <div className="space-y-2">
            {recAlts.map((a) => <RecipeRow key={a.id} r={a} onOpen={() => setOpen(a)} />)}
          </div>
          <RecipeDetail r={open} onClose={() => setOpen(null)} />
        </>
      )}
      <div className="soft p-3 text-xs muted">
        ⚖️ As substituições buscam equilíbrio nutricional e não incentivam restrições alimentares. Mantenha variedade, inclua proteínas, fibras e hidratação, e consulte seu nutricionista antes de mudar a rotina alimentar.
      </div>
    </div>
  );
}

function Fridge() {
  const [sel, setSel] = useState<string[]>([]);
  const [maxT, setMaxT] = useState(0);
  const [maxK, setMaxK] = useState(0);
  const [minP, setMinP] = useState(0);
  const [cat, setCat] = useState<Cat | "todas">("todas");
  const [open, setOpen] = useState<Recipe | null>(null);
  const labels = useMemo(() => Object.fromEntries(fridge.flatMap((g) => g.items.map((i) => [i.key, i.label]))), []);
  const results = recipes
    .filter((r) => (!maxT || r.tempo <= maxT) && (!maxK || r.kcal <= maxK) && r.p >= minP && (cat === "todas" || r.cats.includes(cat)))
    .map((r) => ({ r, have: r.keys.filter((k) => sel.includes(k)).length, missing: r.keys.filter((k) => !sel.includes(k)) }))
    .filter((x) => x.have > 0)
    .sort((a, b) => a.missing.length - b.missing.length || b.have - a.have);
  const ready = results.filter((x) => x.missing.length === 0);
  const almost = results.filter((x) => x.missing.length > 0 && x.missing.length <= 2);
  return (
    <div className="space-y-3">
      <p className="text-sm muted">Marque o que você tem em casa. Sal, azeite, limão e temperos básicos são considerados disponíveis.</p>
      {fridge.map((g) => (
        <div key={g.group}>
          <div className="mb-1 text-sm font-semibold">{g.group}</div>
          <div className="flex flex-wrap gap-2">
            {g.items.map((i) => {
              const on = sel.includes(i.key);
              return <button key={i.key} className={`chip ${on ? "chip-on" : ""}`} onClick={() => setSel(on ? sel.filter((k) => k !== i.key) : [...sel, i.key])}>{i.emoji} {i.label}</button>;
            })}
          </div>
        </div>
      ))}
      {sel.length > 0 && <Btn onClick={() => setSel([])} className="!min-h-9">Limpar seleção ({sel.length})</Btn>}
      <Card className="grid grid-cols-2 gap-2">
        <select className="inp" value={maxT} onChange={(e) => setMaxT(Number(e.target.value))}><option value={0}>Qualquer tempo</option><option value={10}>Até 10 min</option><option value={20}>Até 20 min</option><option value={30}>Até 30 min</option></select>
        <select className="inp" value={maxK} onChange={(e) => setMaxK(Number(e.target.value))}><option value={0}>Qualquer caloria</option><option value={200}>Até 200 kcal</option><option value={300}>Até 300 kcal</option><option value={400}>Até 400 kcal</option></select>
        <select className="inp" value={minP} onChange={(e) => setMinP(Number(e.target.value))}><option value={0}>Qualquer proteína</option><option value={10}>10 g ou mais</option><option value={20}>20 g ou mais</option><option value={30}>30 g ou mais</option></select>
        <select className="inp" value={cat} onChange={(e) => setCat(e.target.value as Cat | "todas")}><option value="todas">Todos os tipos</option>{(Object.keys(catNames) as Cat[]).map((c) => <option key={c} value={c}>{catNames[c]}</option>)}</select>
      </Card>
      {sel.length === 0 ? <Empty text="Selecione ingredientes para ver receitas possíveis." /> : results.length === 0 ? <Empty text="Nenhuma receita encontrada com esses filtros." /> : (
        <>
          <h3 className="font-bold">✅ Você pode fazer agora ({ready.length})</h3>
          {ready.length === 0 && <p className="text-sm muted">Nenhuma receita completa ainda.</p>}
          {ready.map((x) => <RecipeRow key={x.r.id} r={x.r} onOpen={() => setOpen(x.r)} />)}
          {almost.length > 0 && <h3 className="font-bold">🛒 Faltam poucos ingredientes</h3>}
          {almost.map((x) => <RecipeRow key={x.r.id} r={x.r} onOpen={() => setOpen(x.r)} extra={`Faltam: ${x.missing.map((k) => labels[k]).join(", ")}`} />)}
        </>
      )}
      <RecipeDetail r={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Shopping() {
  const s = useApp();
  const [txt, setTxt] = useState("");
  const add = () => { if (txt.trim()) { upsert("shopping", { name: txt.trim(), done: false }); setTxt(""); } };
  return (
    <div className="space-y-3">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input className="inp" placeholder="Adicionar item..." value={txt} onChange={(e) => setTxt(e.target.value)} />
        <Btn type="submit" variant="primary">+</Btn>
      </form>
      {s.shopping.length === 0 && <Empty text="Sua lista está vazia. Abra uma receita e toque em “À lista”." />}
      {s.shopping.map((i) => (
        <div key={i.id} className="card flex items-center gap-3 !p-3">
          <input type="checkbox" className="h-5 w-5 accent-emerald-600" checked={i.done} onChange={() => upsert("shopping", { ...i, done: !i.done })} />
          <span className={`flex-1 ${i.done ? "line-through opacity-50" : ""}`}>{i.name}</span>
          <button aria-label="Remover" onClick={() => remove("shopping", i.id)}>🗑</button>
        </div>
      ))}
      {s.shopping.some((i) => i.done) && <Btn onClick={() => setState((st) => ({ ...st, shopping: st.shopping.filter((i) => !i.done) }))}>Limpar comprados</Btn>}
    </div>
  );
}

function Favorites() {
  const s = useApp();
  const [open, setOpen] = useState<Recipe | null>(null);
  const fr = recipes.filter((r) => s.favorites.includes(r.id));
  const ff = foods.filter((f) => s.favorites.includes(f.id));
  return (
    <div className="space-y-3">
      {fr.length + ff.length === 0 && <Empty text="Toque na ☆ em receitas e alimentos para salvá-los aqui." />}
      {fr.length > 0 && <h3 className="font-bold">Receitas</h3>}
      {fr.map((r) => <RecipeRow key={r.id} r={r} onOpen={() => setOpen(r)} />)}
      {ff.length > 0 && <h3 className="font-bold">Alimentos</h3>}
      {ff.map((f) => (
        <div key={f.id} className="card flex items-center justify-between !p-3">
          <div><div className="font-semibold">{f.nome}</div><div className="text-xs muted">{f.porcao} • {f.kcal} kcal • P {f.p} g • C {f.c} g</div></div>
          <button className="text-xl" onClick={() => toggleFav(f.id)}>★</button>
        </div>
      ))}
      <RecipeDetail r={open} onClose={() => setOpen(null)} />
    </div>
  );
}

export default function Food({ back }: Nav) {
  const [tab, setTab] = useState<"rec" | "sub" | "fri" | "buy" | "fav">("rec");
  return (
    <Screen title="Alimentação" onBack={back}>
      <Tabs value={tab} onChange={setTab} options={[
        { id: "rec", label: "Receitas" }, { id: "sub", label: "Substituir" }, { id: "fri", label: "Geladeira" }, { id: "buy", label: "Compras" }, { id: "fav", label: "Favoritos" },
      ]} />
      {tab === "rec" && <Library />}
      {tab === "sub" && <Substitute />}
      {tab === "fri" && <Fridge />}
      {tab === "buy" && <Shopping />}
      {tab === "fav" && <Favorites />}
    </Screen>
  );
}
