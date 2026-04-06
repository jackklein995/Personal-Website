import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      {/* Welcome */}
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
          Hey, I'm Jack
        </h1>
        <p className="text-xl text-gray-400">Welcome to my personal hub.</p>
      </div>

      {/* Bio */}
      <div className="bg-gray-900 rounded-2xl p-8 mb-10 border border-gray-800">
        <h2 className="text-2xl font-semibold text-white mb-4">About Me</h2>
        <p className="text-gray-300 leading-relaxed text-lg">
          I'm Jack Klein — a developer, motorsport fan, and Red Sox lifer. This site is my
          personal corner of the internet for staying organized and keeping up with the things
          that matter most to me. Whether it's managing my weekly schedule or tracking F1,
          IndyCar, and Red Sox results, it's all here.
        </p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/calendar"
          className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-blue-500 hover:bg-gray-800 transition-all duration-200"
        >
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            Weekly Calendar
          </h3>
          <p className="text-gray-400 leading-relaxed">
            View, add, and manage your events. Click any day to add a new event, click an
            event to remove it.
          </p>
          <span className="inline-block mt-4 text-blue-500 text-sm font-medium group-hover:underline">
            Open Calendar →
          </span>
        </Link>

        <Link
          to="/sports"
          className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-blue-500 hover:bg-gray-800 transition-all duration-200"
        >
          <div className="text-4xl mb-4">🏎️</div>
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            Sports Dashboard
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Live standings and schedules for Formula 1, IndyCar, and the Boston Red Sox —
            all in one place.
          </p>
          <span className="inline-block mt-4 text-blue-500 text-sm font-medium group-hover:underline">
            Open Sports →
          </span>
        </Link>
      </div>
    </div>
  )
}
