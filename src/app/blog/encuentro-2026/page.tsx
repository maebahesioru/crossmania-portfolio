import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Encuentro 2026 — Madrid, 26 de octubre",
  description:
    "El evento Solana del año en España. Madrid, 26 de octubre, 10:00–22:00, entrada gratuita con reserva.",
  alternates: { canonical: "/blog/encuentro-2026" },
};

export default function EncuentroPage() {
  return (
    <div className="shell py-10">
      <p className="label">Blog</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        El Encuentro 2026: el evento Solana del año llega a Madrid
      </h1>
      <p className="mt-3 text-[13px] text-sub">
        2026-10-07 · 海外コミュニティイベントの紹介記事(本文はスペイン語)
      </p>

      <article className="mt-8 max-w-3xl space-y-6 text-[14px] leading-relaxed">
        <p>
          <strong>
            Madrid se prepara para vivir el evento Solana del año.
          </strong>{" "}
          El próximo lunes 26 de octubre, de 10:00 a 22:00, la comunidad Solana de
          España se reúne en Malasaña para celebrar <strong>El Encuentro 2026</strong>,
          el encuentro insignia de La Familia — la comunidad de Solana en España.
        </p>

        <h2 className="display text-xl sm:text-2xl">¿Qué es El Encuentro?</h2>
        <p>
          El Encuentro es el evento anual donde la comunidad web3 española se junta en
          una sola sala: miembros de todo el país, quienes ya construyen en Solana y
          quienes acaban de llegar. Un día para celebrar lo que se ha construido juntos,
          con la ciudad y la cultura de aquí como escenario.
        </p>
        <p>
          Sin feria ni stands: solo gente, ideas y tiempo de sobra para hablar. Así se
          llenó la sala la última vez — este año se espera aún más gente.
        </p>

        <h2 className="display text-xl sm:text-2xl">Lo que te espera</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Charlas</strong> con voces de la comunidad y del ecosistema
          </li>
          <li>
            <strong>Paneles</strong> sobre lo que se está construyendo en Solana desde
            España
          </li>
          <li>
            <strong>Networking</strong> de verdad: el hilo conductor del día
          </li>
        </ul>

        <h2 className="display text-xl sm:text-2xl">Información práctica</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Fecha</strong>: lunes 26 de octubre de 2026
          </li>
          <li>
            <strong>Horario</strong>: 10:00 – 22:00
          </li>
          <li>
            <strong>Lugar</strong>: Malasaña, Madrid (dirección exacta al reservar)
          </li>
          <li>
            <strong>Entrada</strong>: gratis con reserva
          </li>
        </ul>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/encuentro-2026.png"
          alt="El Encuentro 2026 · 26 de octubre · Madrid"
          className="w-full rounded-lg border border-[var(--line)]"
        />

        <h2 className="display text-xl sm:text-2xl">¿Por qué deberías venir?</h2>
        <p>
          Si construyes en Solana desde España —o quieres empezar— este es tu día. No es
          una feria: es la comunidad. Un día entero para conocer a la gente que hace
          posible el ecosistema español, compartir lo que estás construyendo y encontrar
          a tus próximos colaboradores.
        </p>

        <h2 className="display text-xl sm:text-2xl">Reserva tu plaza</h2>
        <p>
          La entrada es gratuita, pero las plazas se agotan. Reserva la tuya aquí:{" "}
          <a
            href="https://lafamilia.so/ir/encuentro-st"
            className="underline"
            rel="noopener noreferrer"
          >
            Reservar plaza en El Encuentro 2026
          </a>
        </p>
        <p>
          Más información y cartel oficial:{" "}
          <a
            href="https://lafamilia.so/ir/encuentro-st"
            className="underline"
            rel="noopener noreferrer"
          >
            lafamilia.so/ir/encuentro-st
          </a>
          <br />
          Sigue a La Familia en X:{" "}
          <a
            href="https://x.com/LaFamilia_so"
            className="underline"
            rel="noopener noreferrer"
          >
            @LaFamilia_so
          </a>
        </p>

        <p className="text-sub">Nos vemos en Madrid el 26 de octubre. 🇪🇸✨</p>
      </article>
    </div>
  );
}
