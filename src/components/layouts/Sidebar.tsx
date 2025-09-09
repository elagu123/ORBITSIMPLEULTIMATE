import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Page } from '../../types/index';
import { Image, Briefcase, Brain } from '../ui/Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  icon: React.JSX.Element; // FIX: Updated JSX.Element to React.JSX.Element for React 19 compatibility
  label: string;
}> = ({ page, activePage, setActivePage, icon, label }) => {
  const isActive = activePage === page;
  return (
    <li
      onClick={() => setActivePage(page)}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors
        ${isActive
          ? 'bg-primary-500 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-gray-800'
        }`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <svg
            className="w-10 h-10 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
        </svg>

        <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-white">Orbit MKT</h1>
      </div>
      <nav className="flex-1">
        <ul className="flex flex-col h-full">
          <NavItem
            page="Dashboard"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Dashboard"
            icon={<DashboardIcon />}
          />
          <NavItem
            page="Customers"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Customers"
            icon={<CustomersIcon />}
          />
          <NavItem
            page="Content"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Content"
            icon={<ContentIcon />}
          />
          <NavItem
            page="Calendar"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Calendar"
            icon={<CalendarIcon />}
          />
          <NavItem
            page="Assets"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Assets"
            icon={<Image className="w-6 h-6" />}
          />
           <NavItem
            page="AIStrategy"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Estrategia IA"
            icon={<Brain className="w-6 h-6" />}
          />
          <NavItem
            page="Systems"
            activePage={activePage}
            setActivePage={setActivePage}
            label="Systems"
            icon={<Briefcase className="w-6 h-6" />}
          />
          <div className="mt-auto">
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
             <NavItem
              page="Settings"
              activePage={activePage}
              setActivePage={setActivePage}
              label="Settings"
              icon={<SettingsIcon />}
            />
          </div>
        </ul>
      </nav>
    </aside>
  );
};


const DashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const CustomersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const ContentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const SettingsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.065 2.572c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default Sidebar;