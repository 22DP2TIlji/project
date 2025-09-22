export default function Projects() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200">{/* Placeholder for background image */}</div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Our Projects</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-light mb-8 text-gray-800">Travel Experiences We've Created</h2>

            <div className="mb-12">
              <h3 className="text-xl font-medium mb-4 text-gray-800">Cultural Heritage Tours</h3>
              <p className="mb-4 text-gray-700">
                Our specialized tours focus on Latvia's rich cultural heritage, from ancient Baltic traditions to
                Soviet-era history. These carefully curated experiences connect travelers with local artisans,
                historians, and communities.
              </p>
              <div className="relative h-64 rounded-md overflow-hidden bg-gray-200">{/* Placeholder for image */}</div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-medium mb-4 text-gray-800">Nature Retreats</h3>
              <p className="mb-4 text-gray-700">
                Latvia's diverse landscapes offer perfect settings for our nature retreats. From coastal getaways to
                forest immersions, these projects connect travelers with Latvia's natural beauty while promoting
                sustainable tourism practices.
              </p>
              <div className="relative h-64 rounded-md overflow-hidden bg-gray-200">{/* Placeholder for image */}</div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4 text-gray-800">Gastronomic Journeys</h3>
              <p className="mb-4 text-gray-700">
                Our food-focused travel experiences showcase Latvia's culinary traditions. Participants enjoy
                farm-to-table experiences, cooking classes with local chefs, and tastings of regional specialties across
                different regions of Latvia.
              </p>
              <div className="relative h-64 rounded-md overflow-hidden bg-gray-200">{/* Placeholder for image */}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
