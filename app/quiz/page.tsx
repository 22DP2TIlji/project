"use client"

import { useState } from "react"
import Link from "next/link"
import { Compass, ChevronRight } from "lucide-react"

type Question = {
  id: string
  text: string
  options: { id: string; value: string; scores: Record<string, number> }[]
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Kāda veida vietas jūs interesē visvairāk?",
    options: [
      { id: "nature", value: "Daba un meži", scores: { nature: 3, park: 2 } },
      { id: "sea", value: "Jūra un pludmales", scores: { beach: 3, nature: 1 } },
      { id: "city", value: "Pilsētas un urbānā vide", scores: { city: 3 } },
      { id: "castles", value: "Pilis un vēsture", scores: { castle: 3 } },
    ],
  },
  {
    id: "q2",
    text: "Cik ilgs būs jūsu brauciens?",
    options: [
      { id: "1", value: "1 diena", scores: {} },
      { id: "2-3", value: "2–3 dienas", scores: {} },
      { id: "4-7", value: "4–7 dienas", scores: {} },
      { id: "7+", value: "Vairāk par nedēļu", scores: {} },
    ],
  },
  {
    id: "q3",
    text: "Kāds ir jūsu plānotais budžets?",
    options: [
      { id: "low", value: "Draudzīgs maciņam", scores: {} },
      { id: "mid", value: "Vidējs", scores: {} },
      { id: "high", value: "Premium", scores: {} },
    ],
  },
]

const CATEGORY_TO_CITY: Record<string, string> = {
  beach: "Jūrmala",
  nature: "Sigulda",
  park: "Sigulda",
  city: "Rīga",
  castle: "Cēsis",
}

const CITY_TO_REGION: Record<string, string> = {
  "Jūrmala": "Vidzeme",
  "Sigulda": "Vidzeme",
  "Rīga": "Vidzeme",
  "Cēsis": "Vidzeme",
  "Liepāja": "Kurzeme",
  "Ventspils": "Kurzeme",
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  beach: "Jūra, smiltis un vasaras noskaņa. Jūrmala un Kurzemes piekraste.",
  nature: "Meži, ezeri un dabas takas. Gaujas Nacionālais parks, Sigulda.",
  park: "Nacionālie parki un dabas rezervāti. Slītere, Ķemeri.",
  city: "Vecpilsētas, muzeji un pilsētas dzīve. Rīga, Kuldīga, Cēsis.",
  castle: "Viduslaiku pilis un vēsture. Cēsis, Turaida, Bauska.",
}

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [finished, setFinished] = useState(false)

  const current = QUESTIONS[step]
  if (!current && !finished) return null

  const select = (opt: (typeof current.options)[0]) => {
    const newScores = { ...scores }
    Object.entries(opt.scores).forEach(([k, v]) => {
      newScores[k] = (newScores[k] || 0) + v
    })
    setScores(newScores)
    if (step >= QUESTIONS.length - 1) {
      setFinished(true)
    } else {
      setStep(step + 1)
    }
  }

  const bestCategory = finished
    ? Object.entries(scores)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])[0]
    : null

  const suggestedCity = bestCategory ? CATEGORY_TO_CITY[bestCategory[0]] ?? "Rīga" : "Rīga"
  const description = bestCategory ? CATEGORY_DESCRIPTIONS[bestCategory[0]] ?? "" : ""

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="travel-hero-title flex items-center justify-center gap-3">
            <Compass className="h-10 w-10" />
            Atrodi savu galamērķi
          </h1>
          <p className="travel-hero-subtitle">Atbildi uz dažiem jautājumiem, lai saņemtu personalizētus ieteikumus</p>
        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4 max-w-xl">
          {!finished ? (
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 mb-4">
                {step + 1} / {QUESTIONS.length}
              </div>
              <h2 className="text-xl font-light mb-6">{current.text}</h2>
              <ul className="space-y-2">
                {current.options.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => select(opt)}
                      className="w-full text-left p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      {opt.value}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 animate-in fade-in duration-500">
              <h2 className="text-xl font-light mb-2">Mēs iesakām:</h2>
              <p className="text-2xl font-medium text-blue-600 mb-2">
                {suggestedCity}
              </p>
              {description && (
                <p className="text-gray-600 mb-6">{description}</p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                {" "}
                <Link href="/trip-planner" className="text-blue-600 hover:underline">
                  Plānojiet pilnu maršrutu
                </Link>{" "}
                balstoties uz savām interesēm.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
    )
    }