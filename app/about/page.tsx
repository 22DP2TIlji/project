export default function About() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">About Us</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-light mb-6 text-gray-800">Our Story</h2>
              <p className="mb-4 text-gray-700">
                Founded by passionate Latvian travel enthusiasts, Travellatvia began with a simple mission: to share the
                hidden treasures of our beautiful country with the world. What started as a small blog documenting our
                favorite local spots has grown into a comprehensive travel service.
              </p>
              <p className="text-gray-700">
                Our team combines deep local knowledge with international travel expertise to create authentic
                experiences that showcase Latvia's rich culture, stunning landscapes, and warm hospitality.
              </p>
            </div>

            <div className="relative h-80 mb-12 rounded-md overflow-hidden bg-gray-200"></div>

            <div className="mb-12">
              <h2 className="text-3xl font-light mb-6 text-gray-800">Our Philosophy</h2>
              <p className="mb-4 text-gray-700">
                We believe travel should be transformative, educational, and sustainable. Every itinerary we create aims
                to connect travelers with authentic Latvian experiences while respecting our environment and supporting
                local communities.
              </p>
              <p className="text-gray-700">
                Whether you're seeking a cultural deep-dive into Riga's historic streets, a peaceful retreat in our
                pristine forests, or an adventure along our Baltic coastline, we're committed to making your Latvian
                journey unforgettable.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-light mb-6 text-gray-800">Meet Our Team</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-40 w-40 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200"></div>
                  <h3 className="font-medium text-gray-800">Līga Bērziņa</h3>
                  <p className="text-sm text-gray-600">Founder & CEO</p>
                </div>
                <div className="text-center">
                  <div className="h-40 w-40 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200"></div>
                  <h3 className="font-medium text-gray-800">Jānis Kalniņš</h3>
                  <p className="text-sm text-gray-600">Travel Expert</p>
                </div>
                <div className="text-center">
                  <div className="h-40 w-40 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200"></div>
                  <h3 className="font-medium text-gray-800">Anna Ozoliņa</h3>
                  <p className="text-sm text-gray-600">Cultural Guide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
