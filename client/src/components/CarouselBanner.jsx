import { useEffect, useState } from 'react';
import { FaAngleLeft, FaAngleRight, FaTimes } from 'react-icons/fa';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    title: 'Campus Grounds',
    caption: 'A vibrant academic and social environment',
  },
  {
    url: 'https://images.unsplash.com/photo-1573164574472-cb89e39749b4',
    title: 'Student Empowerment',
    caption: 'Voices that shape welfare decisions',
  },
  {
    url: 'https://images.unsplash.com/photo-1600195077909-7e82650b14c3',
    title: 'Spiritual Space',
    caption: 'Places of reflection, growth, and peace',
  },
];

export default function CarouselBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Carousel */}
      <div
        className="relative w-full h-64 md:h-[24rem] overflow-hidden rounded-xl shadow-lg group mt-6 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h2 className="text-2xl font-bold">{slide.title}</h2>
              <p className="text-sm">{slide.caption}</p>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"
        >
          <FaAngleLeft />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"
        >
          <FaAngleRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 w-full flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? 'bg-white' : 'bg-gray-400'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-5xl">
            <img
              src={slides[currentIndex].url}
              alt={slides[currentIndex].title}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 bg-white text-black p-2 rounded-full"
            >
              <FaTimes />
            </button>
            <div className="absolute bottom-10 left-6 text-white bg-black/70 p-4 rounded">
              <h2 className="text-xl font-bold">{slides[currentIndex].title}</h2>
              <p className="text-sm">{slides[currentIndex].caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
