import Link from "next/link"

const columns = [
  {
    title: "Plānošana",
    links: [
      ["/trip-planner", "Gudrais plānotājs"],
      ["/itinerary", "Maršruta karte"],
      ["/checklist", "Sagatavošanās"],
    ],
  },
  {
    title: "Atklāšana",
    links: [
      ["/destinations", "Galamērķi"],
      ["/explore", "Pasākumi un virtuve"],
      ["/quiz", "Ieteikumu tests"],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/75 bg-white/80 py-10 text-sm text-slate-600 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/20">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-black text-slate-950">TL</span>
            <div>
              <p className="text-lg font-black">TravelLatvia</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/60">Smart trips</p>
            </div>
          </div>
          <p className="max-w-md text-slate-300">
            Vienota platforma skaistai, pārdomātai un praktiskai ceļojumu plānošanai pa Latviju.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="pt-2">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950">{column.title}</h3>
            <div className="grid gap-3">
              {column.links.map(([href, label]) => (
                <Link key={href} href={href} className="font-semibold transition hover:text-sky-700">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-slate-200/75 px-4 pt-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 TravelLatvia. Visas tiesības aizsargātas.</p>
        <Link href="/cookies" className="font-semibold hover:text-sky-700">Sīkdatņu politika</Link>
      </div>
    </footer>
  )
}