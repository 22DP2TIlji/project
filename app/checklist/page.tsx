"use client"

import { useState, useEffect } from "react"
import { Check, Plus, X, Trash2 } from "lucide-react"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category: string
}

const defaultItems: ChecklistItem[] = [
  { id: "1", text: "Rezervēt naktsmītni", completed: false, category: "Naktsmītnes" },
  { id: "2", text: "Pārbaudīt laikapstākļu prognozi", completed: false, category: "Plānošana" },
  { id: "3", text: "Iepakot pasi / ID karti", completed: false, category: "Dokumenti" },
  { id: "4", text: "Rezervēt transportu", completed: false, category: "Transports" },
  { id: "5", text: "Lejupielādēt bezsaistes kartes", completed: false, category: "Plānošana" },
  { id: "6", text: "Informēt ģimeni / draugus", completed: false, category: "Drošība" },
  { id: "7", text: "Iepakot lādētāju un adapteri", completed: false, category: "Elektronika" },
  { id: "8", text: "Noformēt ceļojuma apdrošināšanu", completed: false, category: "Dokumenti" },
]


export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("Custom")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    const saved = localStorage.getItem("travelChecklist")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        setItems(defaultItems)
      }
    } else {
      setItems(defaultItems)
    }
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("travelChecklist", JSON.stringify(items))
    }
  }, [items])

  const addItem = () => {
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
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const deleteItem = (id: string) => {
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
      <section className="relative h-[40vh] bg-gray-100 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gray-200"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light">Ceļojuma pārbaudes saraksts</h1>
          <p className="mt-4 text-xl">Sagatavojieties ceļojumam</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-light">Progress</h2>
              <span className="text-gray-600">
                {completedCount} / {totalCount} completed
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

          {/* Add new item */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-light mb-4">Pievieno jaunu punktu sarakstam</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === "Ievādiet" && addItem()}
                placeholder="Ievadiet pārbaudes saraksta punktu..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Custom">Pielāgot</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                className={`px-3 py-1 rounded-full text-sm ${
                  filterCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Viss
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist items */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-xl font-light mb-4">Pārbaudes punktu saraksts</h2>
            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-md border ${
                      item.completed
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
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
                        item.completed ? "line-through text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {item.text}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {item.category}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Šajā kategorijā nav pārbaudes punktu</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
