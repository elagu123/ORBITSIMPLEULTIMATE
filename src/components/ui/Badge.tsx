import React, { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ children }) => {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {children}
        </span>
    );
};

export default Badge;
