import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';
import LiveChatWidget from '../components/LiveChatWidget';
import image1 from '../banner/img1.webp';
import image2 from '../banner/img2.webp';
import image3 from '../banner/img3.jpg';
import image4 from '../banner/img4.jpg';
import image5 from '../banner/img5.webp';
import { FaAngleRight, FaAngleLeft, FaCircle } from 'react-icons/fa';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [tier, setTier] = useState(0);

  const images = [
    { src: image1, alt: "Slide 1" },
    { src: image2, alt: "Slide 2" },
    { src: image3, alt: "Slide 3" },
    { src: image4, alt: "Slide 4" },
    { src: image5, alt: "Slide 5" }
  ];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => setCurrentImage(index);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white px-6 py-16 md:py-28 rounded-md overflow-hidden">
        <img
          src="https://t3.ftcdn.net/jpg/12/07/80/26/240_F_1207802652_LM1FCO6kMKK5TEH3nry9S0gVkg9mFvSL.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 block dark:hidden"
        />
        <img
          src="https://t4.ftcdn.net/jpg/10/51/69/51/360_F_1051695114_GLkHsQnLi8PdXqyBgiid9Sjib88cBXSr.jpg"
          alt="Hero Background Dark"
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 hidden dark:block"
        />
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              EMPOWER YOUR <br />
              <span className="text-blue-300">VOICE</span><br />
              ON CAMPUS
            </h1>
            <p className="mt-6 text-lg">
              A secure platform for students to report issues, suggest improvements, and drive welfare-focused change.
            </p>

            <div className="mt-6">
              <input
                type="range"
                min="0"
                max="2"
                value={tier}
                onChange={(e) => setTier(Number(e.target.value))}
                className="w-full accent-blue-400"
              />
              <div className="flex justify-between text-sm text-blue-200 mt-2">
                <span className={tier === 0 ? 'text-white font-semibold' : ''}>Basic</span>
                <span className={tier === 1 ? 'text-white font-semibold' : ''}>Structured</span>
                <span className={tier === 2 ? 'text-white font-semibold' : ''}>Comprehensive</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/get-started">
                <button className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition">
                  Get Started →
                </button>
              </Link>
              <Link to="/dashboard?tab=bookings">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow transition">
                  Book Counseling / Medical
                </button>
              </Link>
              <Link to="/dashboard?tab=tracker">
                <button className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-white font-medium px-6 py-3 rounded-lg shadow border border-gray-300 dark:border-gray-600 transition">
                  Track My Feedback
                </button>
              </Link>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative w-full h-[20rem] md:h-[25rem]">
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <div className="text-white">
                        <h3 className="text-xl font-bold">Campus Moment {index + 1}</h3>
                        <p className="text-sm mt-1">Captured scene reflecting student life and experiences.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Arrows */}
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 text-white p-2 rounded-full shadow hover:bg-white/50 transition backdrop-blur-sm">
              <FaAngleLeft size={24} />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 text-white p-2 rounded-full shadow hover:bg-white/50 transition backdrop-blur-sm">
              <FaAngleRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`text-xs transition-colors ${currentImage === index ? 'text-white' : 'text-white/50'}`}
                >
                  <FaCircle size={10} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className='p-6 bg-amber-100 dark:bg-slate-700'>
        <CallToAction />
      </div>

      {/* Feedback Section */}
      <div className='max-w-6xl mx-auto p-6 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Recent Feedback</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link to='/search' className='text-lg text-teal-500 hover:underline text-center'>
              View all feedback
            </Link>
          </div>
        )}
      </div>

      {/* Live Chat */}
      <LiveChatWidget />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Secure Student Feedback System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
