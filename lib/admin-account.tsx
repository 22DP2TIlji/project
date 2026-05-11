export const ADMIN_EMAIL = 'admin@admin.lv'
export const LEGACY_ADMIN_EMAIL = 'admin@gmail.com'
export const ADMIN_PASSWORD = 'adminpassword'

export function isBuiltInAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return (
    password === ADMIN_PASSWORD &&
    (normalizedEmail === ADMIN_EMAIL || normalizedEmail === LEGACY_ADMIN_EMAIL)
  )
}
