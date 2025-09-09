import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/authContext';
import { Sun, Moon, FacebookIcon, InstagramIcon, TwitterIcon } from '../ui/Icons';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{pageTitle}</h2>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="absolute top-0 left-0 mt-2 ml-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex items-center space-x-3">
            <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-white transition-colors">
                <FacebookIcon className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-white transition-colors">
                <InstagramIcon className="w-5 h-5" />
            </a>
             <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-white transition-colors">
                <TwitterIcon className="w-5 h-5" />
            </a>
        </div>

        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden cursor-pointer block">
            <img src="https://picsum.photos/100" alt="User Avatar" className="w-full h-full object-cover" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 animate-fade-in">
                <a href="#" onClick={(e) => { e.preventDefault(); logout();}} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sign out</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;