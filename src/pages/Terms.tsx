import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/login"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              1. Acceptance
            </h2>
            <p>
              By using EduTrack you agree to these terms. If you do not agree, do not use the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2. Permitted use
            </h2>
            <p>
              EduTrack is intended for educational use by teachers and students. You must not use
              the service to upload harmful content, attempt to access other users' data, or
              interfere with service availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              3. Account responsibility
            </h2>
            <p>
              You are responsible for keeping your password secure and for all activity under your
              account. Notify us immediately if you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              4. Student data
            </h2>
            <p>
              Teachers who create student accounts are responsible for having appropriate consent to
              enter student data. Do not enter data about minors without the required parental or
              institutional consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              5. Service availability
            </h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access. We are not
              liable for any loss caused by service downtime.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. Changes</h2>
            <p>
              We may update these terms. Continued use of EduTrack after changes are posted
              constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
