import React, { useState, useEffect, useRef } from 'react';
import { useOptimizedAuth } from '../../store/optimized/authContext';
import { Sun, Moon, FacebookIcon, InstagramIcon, TwitterIcon, Bell, Settings, User, LogOut, Search } from '../ui/Icons';
import DarkModeToggle from '../ui/DarkModeToggle';
import LanguageSelector from '../ui/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { logout } = useOptimizedAuth();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {pageTitle}
        </h1>
        <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('buttons.search') + '...'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`
                w-full pl-10 pr-4 py-2.5 
                bg-gray-100/80 dark:bg-gray-800/80 
                border border-gray-200/50 dark:border-gray-700/50
                rounded-xl backdrop-blur-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                transition-all duration-300 ease-out
                text-sm placeholder-gray-500 dark:placeholder-gray-400
                ${isSearchFocused ? 'shadow-lg shadow-blue-500/10' : 'shadow-sm'}
              `}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-3">
          <a 
            href="#" 
            aria-label="Facebook" 
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <FacebookIcon className="w-4 h-4" />
          </a>
          <a 
            href="#" 
            aria-label="Instagram" 
            className="p-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 dark:text-gray-400 dark:hover:text-pink-400 dark:hover:bg-pink-900/20 transition-all duration-200"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a 
            href="#" 
            aria-label="Twitter" 
            className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <TwitterIcon className="w-4 h-4" />
          </a>
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(prev => !prev)}
            className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('common.notifications', { defaultValue: 'Notifications' })}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">New customer registered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Campaign performance update</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <LanguageSelector className="mr-2" />
        
        <DarkModeToggle size="md" className="mx-1" />

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(prev => !prev)} 
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-500/50 transition-all duration-200">
              <img 
                src="https://picsum.photos/100" 
                alt="User Avatar" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
              />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    <img src="https://picsum.photos/100" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors">
                  <User className="w-4 h-4 mr-3" />
                  {t('settings.profile')}
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors">
                  <Settings className="w-4 h-4 mr-3" />
                  {t('settings.title')}
                </a>
                <hr className="my-1 border-gray-200/50 dark:border-gray-700/50" />
                <button 
                  onClick={(e) => { e.preventDefault(); logout(); }} 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;