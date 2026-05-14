import Link from "next/link"
import { ArrowRight, CalendarDays, Compass, Map } from "lucide-react"
import RandomPlace from "@/components/random-place"

const features = [
  {
    icon: Compass,
    title: "Atklāj vietas",
    text: "Pilsētas, muižas, dabas takas un pludmales sakārtotas vienotā katalogā.",
    href: "/destinations",
  },
  {
    icon: Map,
    title: "Veido maršrutu",
    text: "Sakārto pieturas, salīdzini idejas un saglabā ceļojumu vēlākam.",
    href: "/itinerary",
  },
  {
    icon: CalendarDays,
    title: "Plāno gudri",
    text: "Izmanto pasākumus, laikapstākļus, budžetu un sagatavošanās sarakstu.",
    href: "/explore",
  },
]

export default function Home() {
  return (
    <>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[1.15fr_0.85fr] md:p-10">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Ceļo gudri pa Latviju</p>
            <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight text-slate-950 md:text-6xl">
              Plāno mierīgu un pārskatāmu ceļojumu pa Latviju.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Atrodi galamērķus, salīdzini idejas un saglabā maršrutu bez liekas vizuālas pārslodzes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/destinations" className="clean-primary-button">
                Apskatīt galamērķus <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/trip-planner" className="clean-secondary-button">
                Sākt plānošanu
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <RandomPlace />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Ko vari izdarīt</span>
              <h2 className="max-w-3xl text-3xl font-medium text-slate-950 md:text-4xl">Viss ceļojuma process izskatās vienots, skaidrs un pabeigts.</h2>
            </div>
            <Link href="/quiz" className="clean-secondary-button w-fit">Atrodi ideju ar testu</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-sky-200 hover:shadow-sm">
                  <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative text-xl font-medium text-slate-950">{feature.title}</h3>
                  <p className="relative mt-3 text-slate-600">{feature.text}</p>
                  <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-700">
                    Atvērt <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
