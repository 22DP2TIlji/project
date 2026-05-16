"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category: string
}

// Noklusējuma kategoriju tulkojumi
const categoryTranslations: Record<string, string> = {
  Accommodation: "Naktsmītnes",
  Planning: "Plānošana",
  Documents: "Dokumenti",
  Transportation: "Transports",
  Safety: "Drošība",
  Electronics: "Elektronika",
  Custom: "Pielāgots",
};

const DEFAULT_ITEM_KEYS = [
  { id: "1", key: "bookAccommodation", category: "Accommodation" },
  { id: "2", key: "checkWeather", category: "Planning" },
  { id: "3", key: "packPassport", category: "Documents" },
  { id: "4", key: "bookTransport", category: "Transportation" },
  { id: "5", key: "downloadMaps", category: "Planning" },
  { id: "6", key: "informFamily", category: "Safety" },
  { id: "7", key: "packCharger", category: "Electronics" },
  { id: "8", key: "getInsurance", category: "Documents" },
]

const ITEM_LABELS: Record<string, string> = {
  bookAccommodation: "Rezervēt naktsmītni",
  checkWeather: "Pārbaudīt laika ziņas",
  packPassport: "Ielikt pasi",
  bookTransport: "Rezervēt transportu",
  downloadMaps: "Lejupielādēt bezsaistes kartes",
  informFamily: "Informēt ģimeni par maršrutu",
  packCharger: "Ielikt tālruņa lādētāju",
  getInsurance: "Iegādāties ceļojumu apdrošināšanu",
}

function getItemLabel(text: string): string {
  return ITEM_LABELS[text] ?? text
}

function createDefaultItems(): ChecklistItem[] {
  return DEFAULT_ITEM_KEYS.map(({ id, key, category }) => ({
    id,
    text: key,
    completed: false,
    category,
  }))
}

function getUserChecklistKey(userId: string): string {
  return `travelChecklist:${userId}`
}
export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [newItemText, setNewItemText] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("Custom")
  const [filterCategory, setFilterCategory] = useState("all")

  const checklistStorageKey = user?.id ? getUserChecklistKey(user.id) : null

  useEffect(() => {
    if (!checklistStorageKey) {
      setItems(createDefaultItems())
      try {
        localStorage.removeItem("travelChecklist")
      } catch {}
      return
    }

    const saved = localStorage.getItem(checklistStorageKey)
    if (saved) {
      try {
        setItems(JSON.parse(saved))
        return
      } catch {
        setItems(createDefaultItems())
        return
      }
    
    }

    setItems(createDefaultItems())
  }, [checklistStorageKey])

  useEffect(() => {
    if (!checklistStorageKey || items.length === 0) return
    localStorage.setItem(checklistStorageKey, JSON.stringify(items))
  }, [items, checklistStorageKey])

  const requireLogin = () => {
    if (isAuthenticated && user?.id) return false
    router.push("/login")
    return true
  }

  const addItem = () => {
    if (requireLogin()) return
    if (!newItemText.trim()) return

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      category: newItemCategory,
    }

    setItems([...items, newItem])
    setNewItemText("")
  }

  const toggleItem = (id: string) => {
    if (requireLogin()) return
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const deleteItem = (id: string) => {
    if (requireLogin()) return
    setItems(items.filter((item) => item.id !== id))
  }

  const categories = Array.from(new Set(items.map((item) => item.category)))
  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((item) => item.category === filterCategory)

  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <>
      <section className="travel-hero">
        <div className="travel-hero-glow"></div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="travel-hero-title text-black-800">Ceļojuma saraksts</h1>
          <p className="mt-4 text-xl">Sagatavojies savam braucienam uz Latviju laicīgi</p>
        </div>
      </section>

      <section className="travel-section">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-light">Progress</h2>
              <span className="text-gray-600">
                Pabeigts {completedCount} no {totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% pabeigts</p>
          </div>

          {!isAuthenticated && (
            <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              Lai rediģētu un atzīmētu sagatavošanās darbus, lūdzu, piesakieties vai reģistrējieties.
            </div>
          )}

          {/* Add new item */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-light mb-4">Pievienot jaunu vienumu</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Ievadiet uzdevumu..."
                disabled={!isAuthenticated}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
               disabled={!isAuthenticated}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="Custom">Pielāgots</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryTranslations[cat] || cat}
                  </option>
                ))}
              </select>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                title={isAuthenticated ? undefined : "Pieslēdzieties, lai pievienotu"}
              >
                <Plus className="h-5 w-5" />
                Pievienot
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Visi
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {categoryTranslations[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist items */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-xl font-light mb-4">Saraksta vienumi</h2>
            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      item.completed
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      title={isAuthenticated ? undefined : "Pieslēdzieties, lai atzīmētu"}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      {item.completed && <Check className="h-4 w-4" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        item.completed ? "line-through text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {getItemLabel(item.text)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">
                      {categoryTranslations[item.category] || item.category}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title={isAuthenticated ? "Dzēst" : "Pieslēdzieties, lai dzēstu"}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Šajā kategorijā vienumu nav</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}