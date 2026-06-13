import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import StudentNav from '../../components/StudentNav'
import TeacherNav from '../../components/TeacherNav'
import { ACCESSORIES, SUBJECTS, type Accessory } from './accessories'

const LEVEL_STYLE: Record<string, string> = {
  Beginner: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Knowledgeable: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

function AccessoryCard({ a }: { a: Accessory }) {
  return (
    <Link
      to={`/explore/${a.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl" aria-hidden="true">
          {a.emoji}
        </span>
        {a.level ? (
          <span
            className={`text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${LEVEL_STYLE[a.level]}`}
          >
            {a.level}
          </span>
        ) : (
          <span className="text-[0.65rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            {a.category}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{a.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300 flex-1">
        {a.blurb}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {a.tags.map((t) => (
          <span
            key={t}
            className="text-[0.65rem] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            {t}
          </span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400">
        Open
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  )
}

export default function Explore() {
  const user = useAuthStore((s) => s.user)
  const isStudent = user?.role === 'STUDENT'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isStudent ? <StudentNav activePage="explore" /> : <TeacherNav activePage="explore" />}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-7 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Learning Accessories
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            Explore & Discover
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {isStudent
              ? 'Interactive apps and games to explore science by subject. Jump into a 3D solar system, descend into the Earth, or play a quick game at your level.'
              : 'Explorative apps and learning games across science subjects you can share with any class. Everything runs in the browser — no setup, no accounts shared.'}
          </p>
        </div>

        {SUBJECTS.map((subject) => {
          const items = ACCESSORIES.filter((a) => a.subject === subject.id)
          if (items.length === 0) return null
          return (
            <section key={subject.id} className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {subject.label}
              </h2>
              <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">{subject.blurb}</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <AccessoryCard key={a.slug} a={a} />
                ))}
              </div>
            </section>
          )
        })}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Public educational content · no account data is shared with these apps.
        </p>
      </main>
    </div>
  )
}
