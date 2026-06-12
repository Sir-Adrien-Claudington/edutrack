import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import StudentNav from '../../components/StudentNav'
import TeacherNav from '../../components/TeacherNav'
import { findAccessory, STARSCAPE_BASE } from './accessories'

export default function AccessoryViewer() {
  const { slug } = useParams<{ slug: string }>()
  const user = useAuthStore((s) => s.user)
  const isStudent = user?.role === 'STUDENT'
  const accessory = findAccessory(slug)

  if (!accessory) return <Navigate to="/explore" replace />

  const src = STARSCAPE_BASE + accessory.path
  const fullSrc = src.replace('embed=1', 'embed=0')
  // The desktop app loads from file://, which StarScape's frame-ancestors
  // policy can't whitelist — so on Electron we open the accessory in the
  // system browser instead of embedding it.
  const isElectron = typeof window !== 'undefined' && !!(window as any).electron

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isStudent ? <StudentNav activePage="explore" /> : <TeacherNav activePage="explore" />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Sub-header: back + title + open full screen */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Accessories
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              <span className="mr-1.5" aria-hidden="true">{accessory.emoji}</span>
              {accessory.title}
            </h1>
          </div>

          <a
            href={fullSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <span className="hidden sm:inline">Open full screen</span>
          </a>
        </div>

        {/* Embedded StarScape feature (web/PWA) — or a launch panel on desktop */}
        {isElectron ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
            <div className="text-5xl mb-4" aria-hidden="true">{accessory.emoji}</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{accessory.title}</h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-gray-600 dark:text-gray-300">
              {accessory.blurb}
            </p>
            <a
              href={fullSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Launch in your browser
            </a>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Opens the activity in your default web browser.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-[#050714]">
              <iframe
                key={accessory.slug}
                src={src}
                title={accessory.title}
                className="w-full block"
                style={{ height: 'min(78vh, 820px)', minHeight: 460, border: 0 }}
                loading="lazy"
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{accessory.blurb}</p>
          </>
        )}
      </div>
    </div>
  )
}
