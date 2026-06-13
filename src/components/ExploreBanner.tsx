import { Link } from 'react-router-dom'

// Dashboard entry point for the Learning Accessories section (/explore).
// accent matches the host dashboard: teal = student, indigo = teacher.
export default function ExploreBanner({ accent = 'teal' }: { accent?: 'teal' | 'indigo' }) {
  const hover =
    accent === 'teal'
      ? 'hover:border-teal-400 dark:hover:border-teal-500'
      : 'hover:border-indigo-400 dark:hover:border-indigo-500'
  const badge = accent === 'teal' ? 'bg-teal-500' : 'bg-indigo-500'
  const cta =
    accent === 'teal' ? 'text-teal-600 dark:text-teal-400' : 'text-indigo-600 dark:text-indigo-400'

  return (
    <Link
      to="/explore"
      className={`group mb-6 flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 transition-all hover:shadow-sm ${hover}`}
    >
      <span className="text-3xl" aria-hidden="true">
        🪐
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Learning Accessories
          <span
            className={`ml-2 align-middle text-[0.6rem] font-bold uppercase tracking-wider text-white rounded-full px-2 py-0.5 ${badge}`}
          >
            New
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          Explore 3D science worlds — space, geology and more — plus games by level.
        </p>
      </div>
      <span
        className={`text-sm font-medium shrink-0 transition-transform group-hover:translate-x-0.5 ${cta}`}
      >
        Explore →
      </span>
    </Link>
  )
}
