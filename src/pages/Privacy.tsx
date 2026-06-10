import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/login"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              1. Data we collect
            </h2>
            <p>
              EduTrack collects name, email address, role (teacher or student), and academic data
              (assignment submissions, grades, progress) that you enter directly. We also collect
              standard server logs (IP address, request path, timestamp) for security and debugging.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2. How we use your data
            </h2>
            <p>
              Your data is used solely to operate the EduTrack service — showing teachers their
              class analytics and students their own progress. We do not sell or share your personal
              data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              3. AI features
            </h2>
            <p>
              The class insight feature sends anonymised, aggregated classroom data (first names
              only and average scores) to the Anthropic API to generate teaching suggestions. No
              email addresses or full names are sent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              4. Data retention
            </h2>
            <p>
              Your data is retained for as long as your account is active. You may delete your
              account at any time from the Settings page. Deleted accounts and their associated data
              are removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              5. Security
            </h2>
            <p>
              Passwords are hashed using bcrypt. Data is transmitted over HTTPS. Access tokens
              expire after 15 minutes and refresh tokens after 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. Contact</h2>
            <p>
              For privacy questions, contact us at the email address on the EduTrack registration
              page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
