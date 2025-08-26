export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">

        {/* Textual Content */}
        <div>
          <h1 className="text-4xl font-bold mb-4">
            About the Secure Student Feedback & Welfare Suite (SSFWS)
          </h1>
          <p className="text-green-400 font-semibold mb-4">
            A digital-first platform championing student voice and accountability
          </p>
          <p className="text-gray-300 mb-4">
            The Secure Student Feedback & Welfare Suite (SSFWS) is a student-centered digital system created to foster transparency,
            welfare responsiveness, and leadership accountability within Africa University and similar institutions. Built to support
            both academic and non-academic concerns, it ensures students can safely raise issues, submit suggestions, and contribute to positive change.
          </p>
          <p className="text-gray-400">
            With features like anonymous reporting, real-time status tracking, and a wellness-oriented interface, SSFWS is transforming
            how students engage with administration — not as distant complainants, but as partners in institutional progress.
          </p>

          {/* Metrics Section */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">3,500+</p>
              <p className="text-sm text-gray-400 mt-1">Feedback Entries Logged</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">95%</p>
              <p className="text-sm text-gray-400 mt-1">Issues Resolved Within 72 Hours</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">25+</p>
              <p className="text-sm text-gray-400 mt-1">Institutions Influenced</p>
            </div>
          </div>
        </div>

        {/* Right-Side Image */}
        <div className="relative">
          <img
            src="https://www.africau.edu/images/stories/slideshow/studentslibrary.jpg"
            alt="Students at Africa University"
            className="rounded-lg shadow-xl w-full object-cover"
          />
          {/* Decorative Effects */}
          <div className="absolute -bottom-8 -right-10 w-24 h-24 bg-yellow-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
          <div className="absolute -bottom-16 right-0 w-10 h-10 bg-yellow-400 rounded-full opacity-40 blur-md animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
