"use client"

import Link from "next/link"
import RandomPlace from "@/components/random-place"

export default function Home() {
  return (
    <>
      {/* Galvenais reklāmas laukums (Hero Section) */}
      <section className="relative h-[70vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-light mb-4">Atklāj Latviju</h1>
          <p className="text-xl md:text-2xl font-light mb-8">
            Plāno savu perfekto ceļojumu pa Latviju
          </p>
        </div>
      </section>

      {/* Galvenā satura daļa */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
            {/* Kreisais bloks - Informācija */}
            <div className="md:col-span-2 flex flex-col">
              <div className="flex-grow border border-gray-200 p-8 md:p-12 rounded-md text-center flex flex-col justify-center items-center">
                <h2 className="text-3xl font-light mb-4">
                  Mēs palīdzēsim Tev noorganizēt braucienu
                </h2>
                <Link
                  href="/destinations"
                  className="inline-block mt-6 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Izpētīt galamērķus
                </Link>
              </div>
            </div>

            {/* Labais bloks - Nejauša vieta (RandomPlace) */}
            <div className="flex flex-col">
              <div className="flex-grow h-full">
                {/* Piezīme: Lai šis darbotos perfekti, RandomPlace komponenta 
                   iekšienē galvenajam div elementam jābūt ar klasi "h-full"
                */}
                <RandomPlace />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}