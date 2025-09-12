import React from 'react';
import { getSkipLinkProps } from '../../utils/accessibility';

/**
 * Skip links component for keyboard navigation
 * Allows users to skip to main content sections
 */
const SkipLinks: React.FC = () => {
  const skipLinks = [
    { href: 'main-content', label: 'Skip to main content' },
    { href: 'navigation', label: 'Skip to navigation' },
    { href: 'search', label: 'Skip to search' },
    { href: 'footer', label: 'Skip to footer' },
  ];

  return (
    <nav 
      aria-label="Skip links"
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-50"
    >
      <ul className="flex flex-col gap-2 p-4 bg-blue-600 text-white">
        {skipLinks.map(({ href, label }) => (
          <li key={href}>
            <a
              {...getSkipLinkProps(href)}
              className="
                inline-block px-4 py-2 bg-blue-700 text-white 
                rounded focus:outline-none focus:ring-2 
                focus:ring-white focus:ring-offset-2 
                focus:ring-offset-blue-600 hover:bg-blue-800
                transition-colors
              "
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;