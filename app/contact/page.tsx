"use client"

import { Mail, MapPin, Phone } from "lucide-react"

export default function Contact() {
  return (
    <>
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900">Sazinieties ar mums</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-light mb-6 text-gray-900">Saziņa</h2>
                <p className="mb-8 text-gray-700">
                  Vai jums ir jautājumi par ceļojuma plānošanu uz Latviju? Mēs labprāt jums palīdzēsim. Nosūtiet mums ziņu, un mēs atbildēsim pēc iespējas ātrāk.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Adrese</h3>
                      <p className="text-gray-600">Rīga, Latvija</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <Phone className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Tālrunis</h3>
                      <p className="text-gray-600">+371 123 45678</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <Mail className="w-5 h-5 mr-3 mt-1 text-gray-600" />
                    <div>
                      <h3 className="font-medium">E-pasts</h3>
                      <p className="text-gray-600">info@travelatvia.lv</p>
                    </div>
                  </div>
                </div>

                {/* Kartes vieta */}
                <div className="h-64 rounded-md overflow-hidden bg-gray-200 border border-gray-300">
                  <div className="w-full h-full flex items-center justify-center text-gray-500 italic">
                    Karte drīzumā...
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-light mb-6 text-gray-900">Sūtiet mums ziņu</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                      Jūsu vārds
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900"
                      placeholder="Jānis Bērziņš"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                      E-pasta adrese
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900"
                      placeholder="janis@piemers.lv"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">
                      Temats
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900"
                      placeholder="Ceļojuma pieprasījums"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                      Ziņa
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900"
                      placeholder="Pastāstiet mums par saviem ceļojuma plāniem..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    Nosūtīt ziņu
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