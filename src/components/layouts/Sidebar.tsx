import React from 'react';
import { Page } from '../../types/index';
import { Image, Briefcase, Brain, Home, Users, FileText, Calendar, Settings, ChevronRight } from '../ui/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  icon: React.JSX.Element;
  label: string;
  badge?: string;
}> = ({ page, activePage, setActivePage, icon, label, badge }) => {
  const isActive = activePage === page;
  return (
    <li className="mb-2">
      <button
        onClick={() => setActivePage(page)}
        className={`
          w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
          ${isActive
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
          }
        `}
      >
        <div className="flex items-center">
          <div className={`
            p-1 rounded-lg transition-colors duration-200
            ${isActive 
              ? 'bg-white/20' 
              : 'group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/20'
            }
          `}>
            {React.cloneElement(icon, { 
              className: `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}` 
            })}
          </div>
          <span className="ml-3 font-medium">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {badge && (
            <span className={`
              px-2 py-1 text-xs font-semibold rounded-full
              ${isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              }
            `}>
              {badge}
            </span>
          )}
          <ChevronRight className={`
            w-4 h-4 transition-transform duration-200
            ${isActive 
              ? 'text-white/70 rotate-90' 
              : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1'
            }
          `} />
        </div>
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { getPageTitle } = useTranslation();

  return (
    <aside className="w-72 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="m8 3 4 8 5-3-5 7-4-8-5 3 5-7z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
        </div>
        <div className="ml-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Orbit MKT
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Marketing Suite</p>
        </div>
      </div>

      <nav className="flex-1">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Main Navigation
          </p>
          
          <NavItem
            page="Dashboard"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('dashboard')}
            icon={<Home />}
            badge="2"
          />
          
          <NavItem
            page="Customers"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('customers')}
            icon={<Users />}
            badge="24"
          />
          
          <NavItem
            page="Content"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('content')}
            icon={<FileText />}
          />
          
          <NavItem
            page="Calendar"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('calendar')}
            icon={<Calendar />}
            badge="3"
          />
          
          <NavItem
            page="Assets"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('assets')}
            icon={<Image />}
          />
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            AI & Automation
          </p>
          
          <NavItem
            page="AIStrategy"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('aistrategy')}
            icon={<Brain />}
            badge="NEW"
          />
          
          <NavItem
            page="Systems"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('systems')}
            icon={<Briefcase />}
          />
        </div>

        <div className="mt-auto pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">AI Credits</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">847 / 1000 remaining</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-4/5"></div>
            </div>
          </div>

          <hr className="border-gray-200/50 dark:border-gray-700/50 mb-4" />
          
          <NavItem
            page="Settings"
            activePage={activePage}
            setActivePage={setActivePage}
            label={getPageTitle('settings')}
            icon={<Settings />}
          />
        </div>
      </nav>
    </aside>
  );
};


export default Sidebar;