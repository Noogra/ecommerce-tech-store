import { Link } from 'react-router-dom';
import Logo from '../../assets/logo';

const footerLinks = {
  Shop: [
    { name: 'Mobile Phones', to: '/category/mobile-phones' },
    { name: 'Accessories', to: '/category/accessories' },
    { name: 'Computers & Tablets', to: '/category/computers-tablets' },
  ],
  Support: [
    { name: 'Contact Us', to: '#' },
    { name: 'FAQs', to: '#' },
    { name: 'Shipping Info', to: '#' },
    { name: 'Returns', to: '#' },
  ],
  Company: [
    { name: 'About Us', to: '#' },
    { name: 'Careers', to: '#' },
    { name: 'Privacy Policy', to: '#' },
    { name: 'Terms of Service', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Logo className="[&_span]:text-white [&_svg]:text-accent" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Your premium destination for the latest smartphones, accessories, and tech.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PhoneStop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="text-xs">Built with React + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
