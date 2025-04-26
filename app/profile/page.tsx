'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user, updatePreferences } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [preferredTransportMode, setPreferredTransportMode] = useState('car')
  const [language, setLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login')
      return
    }

    // Load user preferences
    if (user.preferences) {
      setPreferredTransportMode(user.preferences.preferredTransportMode || 'car')
      setLanguage(user.preferences.language || 'en')
    }
  }, [user, router])

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      await updatePreferences({
        darkMode,
        preferredTransportMode,
        language
      })
      setMessage('Preferences saved successfully!')
    } catch (error) {
      setMessage('Error saving preferences. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              User Profile
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Account Information</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePreferences}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Preferences</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`${
                          darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            darkMode ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>

                    <div>
                      <label htmlFor="transport-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Transport Mode
                      </label>
                      <select
                        id="transport-mode"
                        name="transport-mode"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        value={preferredTransportMode}
                        onChange={(e) => setPreferredTransportMode(e.target.value)}
                      >
                        <option value="car">Car</option>
                        <option value="walking">Walking</option>
                        <option value="cycling">Cycling</option>
                        <option value="public">Public Transport</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="lv">Latvian</option>
                        <option value="ru">Russian</option>
                      </select>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                    {message}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 