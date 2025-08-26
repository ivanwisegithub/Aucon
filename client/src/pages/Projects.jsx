import CallToAction from '../components/CallToAction';

export default function Projects() {
  return (
    <div className="relative min-h-screen flex justify-center items-center flex-col gap-6 p-3 text-center overflow-hidden">
      {/* Background image for light mode */}
      <img
        src="https://t3.ftcdn.net/jpg/07/82/17/18/240_F_782171891_2eb89mRIFHGaGaRyDQbw65oMfVxOmXYs.jpg"
        alt="Projects Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 block dark:hidden"
      />
      {/* Background image for dark mode */}
      <img
        src="https://t3.ftcdn.net/jpg/07/82/17/18/240_F_782171891_2eb89mRIFHGaGaRyDQbw65oMfVxOmXYs.jpg"
        alt="Projects Background Dark"
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 hidden dark:block"
      />
      {/* Overlay for extra contrast */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-white">Student Initiatives</h1>
        <p className="text-md text-gray-200">
          Explore approved feedback-driven projects and welfare ideas initiated by students through the SSFS platform.
        </p>
        <CallToAction />
      </div>
    </div>
  );
}
