'use client';

import { useState, useEffect } from 'react';

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show button after scrolling
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phoneNumber = '08073042250';
  const message = encodeURIComponent('Hello! I need help with my order on EAZY.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <>
      {/* Floating Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group relative"
        >
          {/* WhatsApp Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-white"
          >
            <path d="M12.032 0C5.384 0 0 5.384 0 12.032c0 2.144.576 4.224 1.664 6.048L0 24l6.016-1.632c1.76.992 3.776 1.504 5.952 1.504 6.624 0 12.032-5.408 12.032-12.032C24 5.408 18.624 0 12.032 0zM12.032 21.952c-1.824 0-3.616-.48-5.184-1.408l-.368-.224-3.584.96.96-3.52-.224-.352c-1.024-1.6-1.568-3.456-1.568-5.376 0-5.536 4.512-10.048 10.048-10.048s10.048 4.512 10.048 10.048-4.512 10.048-10.048 10.048zM17.824 14.4c-.256-.128-1.504-.736-1.728-.832-.224-.096-.384-.128-.544.128-.16.256-.608.832-.736 1.024-.128.16-.256.192-.512.064-.256-.128-1.088-.384-2.08-1.28-.768-.704-1.28-1.568-1.44-1.824-.128-.256-.016-.384.096-.512.128-.128.256-.32.384-.48.128-.128.192-.256.288-.416.096-.16.048-.288-.016-.416-.064-.128-.544-1.312-.768-1.792-.192-.448-.384-.384-.544-.384h-.448c-.16 0-.416.064-.64.32-.224.256-.832.832-.832 2.016 0 1.184.864 2.336.992 2.496.128.16 1.696 2.592 4.096 3.632.576.256 1.024.416 1.376.544.576.192 1.088.16 1.504.096.464-.064 1.408-.576 1.6-1.12.192-.544.192-1.008.128-1.12-.064-.128-.224-.192-.48-.32z" />
          </svg>

          {/* Tooltip */}
          <div
            className={`absolute right-full mr-3 whitespace-nowrap bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-all duration-300 ${
              isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            Need help? Chat with us
            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </a>
      </div>

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        .group:hover {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </>
  );
}