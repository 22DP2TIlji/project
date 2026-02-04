import { Mail, MapPin, Phone } from "lucide-react"

export default function Contact() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Kontakts</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-light mb-6">Sazināties</h2>
                <p className="mb-8 text-gray-700">
                  Jums ir jautājumi par ceļošanu Latvijā? Vēlaties rezervēt ekskursiju vai izveidot individuālu ceļojuma maršrutu? Mēs esam šeit,
 lai palīdzētu padarīt jūsu piedzīvojumu Latvijā neaizmirstamu.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Adrese</h3>
                      <p className="text-gray-600">Kalēju iela 23, Riga, LV-1050, Latvia</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <Phone className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Tālrunis</h3>
                      <p className="text-gray-600">+371 2345 6789</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <Mail className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">E-pasts</h3>
                      <p className="text-gray-600">info@travellatvia.com</p>
                    </div>
                  </div>
                </div>

                <div className="h-64 rounded-md overflow-hidden bg-gray-200"></div>
              </div>

              <div>
                <h2 className="text-3xl font-light mb-6">Sūtiet mums ziņu</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium">
                      Jūsu vārds
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">
                      E-pasta adrese
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium">
                      Temats
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Trip Inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium">
                      Ziņa
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Tell us about your travel plans..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Sūtīt ziņu
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
