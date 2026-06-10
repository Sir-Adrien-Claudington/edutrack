import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

interface NavItem {
  to: string
  label: string
  icon: string
  live: boolean
}

const nav: NavItem[] = [
  { to: '/admin/users',      label: 'Users',      icon: '👥', live: true },
  { to: '/admin/classrooms', label: 'Classrooms', icon: '🏫', live: true },
  { to: '/admin/content',    label: 'Content',    icon: '📋', live: true },
  { to: '/admin/analytics',  label: 'Analytics',  icon: '📊', live: true },
  { to: '/admin/settings',   label: 'Settings',   icon: '⚙️',  live: true },
  { to: '/admin/security',   label: 'Security',   icon: '🔒', live: true },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔭</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">EduTrack</span>
        </div>
        <span className="mt-1 inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => (
          item.live ? (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ) : (
            <div
              key={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-600 cursor-default"
            >
              <span>{item.icon}</span>
              {item.label}
              <span className="ml-auto text-xs text-gray-300 dark:text-gray-600">Soon</span>
            </div>
          )
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-50 w-64 bg-white dark:bg-gray-800 flex flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔭</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">EduTrack</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
