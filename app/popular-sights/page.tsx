"use client"

import LikeButton from "@/components/like-button"

const destinations = [
  {
    id: "riga",
    name: "Old town, Riga",
    description:
      "Explore the charming cobblestone streets and colorful buildings of Riga's historic Old Town, a UNESCO World Heritage site featuring stunning architecture from various periods.",
  },
  {
    id: "sigulda",
    name: "Sigulda",
    description:
      'Known as the "Switzerland of Latvia," Sigulda offers breathtaking landscapes, medieval castles, and outdoor activities surrounded by the picturesque Gauja National Park.',
  },
  {
    id: "jurmala",
    name: "Jūrmala",
    description:
      "Latvia's premier beach resort town features 33 km of white sand beaches along the Baltic Sea, charming wooden architecture, and a relaxing spa culture.",
  },
  {
    id: "cesis",
    name: "Cēsis",
    description:
      "One of Latvia's most picturesque towns, Cēsis boasts a well-preserved medieval castle, charming old town, and beautiful surroundings perfect for history enthusiasts.",
  },
  {
    id: "kuldiga",
    name: "Kuldīga",
    description:
      "A picturesque town known for its red-tiled roofs, cobblestone streets, and Europe's widest waterfall, Ventas Rumba. The historic center is a well-preserved example of a traditional Latvian town.",
  },
  {
    id: "liepaja",
    name: "Liepāja",
    description:
      "A coastal city with beautiful beaches, a historic naval port, and a vibrant music scene. Known as 'The city where the wind is born,' Liepāja offers a mix of cultural heritage and seaside charm.",
  },
  {
    id: "rundale",
    name: "Rundāle Palace",
    description:
      "A magnificent baroque palace often called the 'Versailles of Latvia.' The palace features stunning architecture, lavish interiors, and beautiful French-style gardens.",
  },
  {
    id: "gauja",
    name: "Gauja National Park",
    description:
      "Latvia's largest and oldest national park, featuring diverse landscapes, medieval castles, sandstone cliffs, and extensive hiking and cycling trails through pristine nature.",
  },
]

export default function PopularSights() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Popular sights</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="group border border-gray-200 rounded-md p-6 hover:shadow-md transition-shadow"
              >
                <div className="relative h-64 mb-4 overflow-hidden rounded-md bg-gray-200">
                  {/* Placeholder for image */}
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-medium">{destination.name}</h3>
                  <LikeButton destinationId={destination.id} destinationName={destination.name} />
                </div>
                <p className="mt-2 text-gray-600">{destination.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

