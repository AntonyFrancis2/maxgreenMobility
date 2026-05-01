import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { siteBulletListLiClass, siteCardStackClass } from "@/lib/layoutTheme";
import { getSiteRuntime } from "@/lib/runtimeContent";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Maxgreen Mobility’s mission, vision, and values.",
};

export default async function AboutPage() {
  const site = await getSiteRuntime();
  const about = site.about;
  const stackMission = siteCardStackClass("start");
  const stackVision = siteCardStackClass("start");
  const bulletsMission = siteBulletListLiClass("start");
  const bulletsVision = siteBulletListLiClass("start");
  const cardStats = siteCardStackClass("start");
  const cardValues = siteCardStackClass("start");

  return (
    <div>
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{about.hero.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">{about.hero.subtitle}</p>
        </Container>
      </section>

      <section className="py-12">
        <Container className="grid gap-5 md:grid-cols-2">
          <div className={`rounded-[var(--radius-lg)] border border-border bg-[#f2fff5] p-7 ${stackMission}`}>
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              ◎
            </div>
            <h2 className="mt-4 text-lg font-extrabold">{about.mission.title}</h2>
            <p className="mt-2 text-sm text-muted">{about.mission.body}</p>
            <ul className={`mt-4 w-full space-y-2 text-sm text-foreground/80 ${bulletsMission}`}>
              {about.mission.bullets.map((b: string) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-0.5 text-brand">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-[var(--radius-lg)] border border-border bg-[#f2f7ff] p-7 ${stackVision}`}>
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              ◉
            </div>
            <h2 className="mt-4 text-lg font-extrabold">{about.vision.title}</h2>
            <p className="mt-2 text-sm text-muted">{about.vision.body}</p>
            <ul className={`mt-4 w-full space-y-2 text-sm text-foreground/80 ${bulletsVision}`}>
              {about.vision.bullets.map((b: string) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.stats.map((s) => (
            <div key={s.label} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${cardStats}`}>
              <div className="text-2xl font-extrabold text-brand">{s.value}</div>
              <div className="mt-1 text-xs font-semibold text-muted">{s.label}</div>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-surface py-12">
        <Container>
          <h2 className="text-center text-2xl font-extrabold tracking-tight">{about.leadership.quoteTitle}</h2>
          <div className="mt-8 grid gap-6 rounded-[var(--radius-lg)] border border-border bg-white p-6 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] bg-[#eef6ff] p-6 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-white ring-1 ring-border">
                <Image src={about.leadership.image} alt={about.leadership.name} fill />
              </div>
              <div>
                <div className="text-sm font-extrabold">{about.leadership.name}</div>
                <div className="text-xs text-muted">{about.leadership.title}</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-[var(--radius-lg)] bg-[#f7fafc] p-6">
                <div className="text-brand text-3xl leading-none">“</div>
                <div className="mt-2 space-y-4 text-sm text-foreground/85">
                  {about.leadership.message.map((p: string) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <div className="mt-6 text-xs font-bold text-muted">{about.leadership.name}</div>
                <div className="text-xs text-muted">{about.leadership.title}</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <h2 className="text-center text-2xl font-extrabold tracking-tight">{about.values.title}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.items.map((v) => (
              <div key={v.title} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${cardValues}`}>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                  ✦
                </div>
                <div className="mt-4 font-extrabold">{v.title}</div>
                <div className="mt-1 text-sm text-muted">{v.subtitle}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

