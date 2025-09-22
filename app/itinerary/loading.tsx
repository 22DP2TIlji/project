export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-light mb-4 text-gray-800">Loading Itinerary Planner...</h2>
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
