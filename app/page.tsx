import { WeatherDashboard } from "@/components/weather-dashboard"
import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"

// Import ChatBot with no SSR to avoid hydration issues
const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false })

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <HeroSection />
        <WeatherDashboard />
      </div>
      {/* <ChatBot/> */}
    </>
  )
}
