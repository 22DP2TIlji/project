// app/profile/page.tsx
"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isAdmin, updateProfile } = useAuth()
  const router = useRouter()

  const [showChangePassword, setShowChangePassword] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push("/login")
  }, [isAuthenticated, router])

  if (!user) return null

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setErr(null)

    if (!currentPassword || !newPassword) {
      setErr("Please fill in all password fields.")
      return
    }
    if (newPassword.length < 6) {
      setErr("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.")
      return
    }

    setSaving(true)
    try {
      const res = await updateProfile({
        currentPassword,
        newPassword,
      })

      if (res.success) {
        setMsg("Password updated ✅")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowChangePassword(false) // закрыть форму после успеха
      } else {
        setErr(res.message || "Failed to update password")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-light text-gray-900 dark:text-white">
          Account Profile
        </h2>

        {/* INFO (always visible) */}
        <div className="mb-4">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Name:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</span>
        </div>

        <div className="mb-4">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Email:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</span>
        </div>

        <div className="mb-6">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Role:</span>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {isAdmin() ? "Admin" : "User"}
          </span>
        </div>

        {/* Feedback */}
        {err && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
            {msg}
          </div>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => {
            setErr(null)
            setMsg(null)
            setShowChangePassword((v) => !v)
          }}
          className="mb-4 w-full rounded-md border border-gray-300 py-3 px-4 text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
        >
          {showChangePassword ? "Cancel" : "Change password"}
        </button>

        {/* Password form (hidden until button click) */}
        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="mb-6 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-blue-600 py-3 px-4 text-white transition-colors hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {saving ? "Saving..." : "Update password"}
            </button>
          </form>
        )}

{/* Admin panel button (only for admin) */}
{isAdmin() && (
  <button
    type="button"
    onClick={() => router.push("/admin")}
    className="mb-3 w-full rounded-md bg-gray-900 py-3 px-4 text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
  >
    Admin panel
  </button>
)}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full rounded-md bg-red-600 py-3 px-4 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
