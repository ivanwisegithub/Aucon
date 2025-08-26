import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import {
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsGithub,
  BsDribbble,
} from 'react-icons/bs';
import { useSelector } from 'react-redux';

export default function FooterCom() {
  const { theme } = useSelector((state) => state.theme);

  const bgImageLight =
    'https://t3.ftcdn.net/jpg/06/61/55/80/240_F_661558079_b5Ts0iC1T3nB6DnYpIRS2jgA0E1bTMC2.jpg';
  const bgImageDark =
    'https://t3.ftcdn.net/jpg/06/61/55/80/240_F_661558079_b5Ts0iC1T3nB6DnYpIRS2jgA0E1bTMC2.jpg';

  return (
    <footer
      className="relative text-white"
      style={{
        backgroundImage: `url(${theme === 'dark' ? bgImageDark : bgImageLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay to ensure readability */}
      <div className="bg-black/60 dark:bg-black/70 w-full min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6 text-white">
          {/* Section 1: Contact Info */}
          <div>
            <h2 className="text-xl font-bold">
              Name <span className="text-yellow-400">Surname</span>
            </h2>
            <p className="text-sm mb-4">General Manager</p>
            <ul className="text-sm space-y-1">
              <li><strong>Phone:</strong> 0000 0000 0000</li>
              <li><strong>Email:</strong> your@mail.com</li>
              <li><strong>Web:</strong> www.yoursite.com</li>
              <li><strong>Address:</strong> 123, Your Address Here</li>
            </ul>
          </div>

          {/* Section 2: Links */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <Footer.Title title="About" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="https://res.cloudinary.com/dwoteekrp/image/upload/v1747949184/sazqyblco65eu0ikssjz.png"
                  target="_blank"
                >
                  100 JS Projects
                </Footer.Link>
                <Link to="/about" className="hover:underline">
                  Comrads's SFB
                </Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow Us" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="https://github.com/ivanwisegb"
                  target="_blank"
                >
                  GitHub
                </Footer.Link>
                <Footer.Link href="96c6-00bc1f1522f3">Discord</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>

          {/* Section 3: Brand and Socials */}
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="https://cdn.kwork.com/files/portfolio/t3/27/6ad31a29bd59bc403cf500258013f0a4880e8b76-1724610290.jpg"
              alt="Brand Logo"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-2 object-cover"
            />
            <h4 className="text-lg font-bold">BRAND NAME</h4>
            <p className="text-sm mb-4">Your tagline here</p>
            <div className="flex gap-4">
              <Footer.Icon href="#" icon={BsFacebook} />
              <Footer.Icon href="#" icon={BsInstagram} />
              <Footer.Icon href="#" icon={BsTwitter} />
              <Footer.Icon href="#" icon={BsGithub} />
              <Footer.Icon href="#" icon={BsDribbble} />
            </div>
          </div>
        </div>

        <Footer.Divider className="border-gray-300 dark:border-gray-700" />

        {/* Bottom Bar */}
        <div className="text-center text-xs text-white py-3">
          <Footer.Copyright
            href="#"
            by="Comrads's SFB"
            year={new Date().getFullYear()}
          />
        </div>
      </div>
    </footer>
  );
}
