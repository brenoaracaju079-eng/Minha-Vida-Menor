import InstallButton from "./InstallButton";

export const metadata = { title: "Instalar Minha Vida Menor" };

export default function InstalarPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-5 px-5 py-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-512.png" alt="Logotipo Minha Vida Menor" width={140} height={140} className="rounded-[2rem] shadow-lg" />
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--em)]">Minha Vida Menor</h1>
        <p className="mt-1 font-semibold">Acompanhe, Cuide, Conquiste!</p>
      </div>
      <p className="muted">
        Seu assistente pessoal e gratuito para acompanhar o emagrecimento: medicamentos, aplicações com mapa corporal, alimentação,
        hidratação, atividades, evolução, sintomas e relatório mensal em PDF. Sem anúncios, sem assinatura e com dados guardados só no seu celular.
      </p>
      <InstallButton />
      <div className="card w-full space-y-2 text-left text-sm">
        <h2 className="font-bold">Como instalar no Android</h2>
        <ol className="ml-5 list-decimal space-y-1">
          <li>Abra esta página no <b>Google Chrome</b> do seu celular.</li>
          <li>Toque no botão verde acima (ou no menu <b>⋮</b> → <b>Instalar aplicativo</b>).</li>
          <li>Confirme em <b>Instalar</b>.</li>
          <li>Abra <b>Minha Vida Menor</b> pela lista de aplicativos, com nome e ícone próprios.</li>
        </ol>
        <p className="muted">Depois de instalado, funciona sem internet. Não é preciso Android Studio nem autorizar “fontes desconhecidas”.</p>
      </div>
      <a href="/" className="btn w-full">Abrir no navegador</a>
      <a href="/icons/logo-transparente.png" download className="text-sm underline muted">Baixar logotipo (PNG transparente)</a>
    </main>
  );
}
