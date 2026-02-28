"use client"

type Budget = {
  transport: number
  accommodation: number
  food: number
  entertainment: number
  total: number
}

const LABELS: Record<string, string> = {
  transport: "Transport",
  accommodation: "Accommodation",
  food: "Food",
  entertainment: "Entertainment",
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export default function BudgetChart({ budget }: { budget: Budget }) {
  const items = [
    { key: "transport", value: budget.transport },
    { key: "accommodation", value: budget.accommodation },
    { key: "food", value: budget.food },
    { key: "entertainment", value: budget.entertainment },
  ].filter((i) => i.value > 0)

  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{LABELS[item.key]}</span>
            <span className="font-medium">{item.value}€</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
      {budget.total > 0 && (
        <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-medium">
          <span>Total</span>
          <span>{budget.total}€</span>
        </div>
      )}
    </div>
  )
}
