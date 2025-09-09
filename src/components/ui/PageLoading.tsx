import React from 'react';

interface PageLoadingProps {
  pageName?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ pageName }) => {
  return (
    <div className="flex items-center justify-center h-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Cargando {pageName || 'página'}...
        </h2>
        <p className="text-gray-600 text-sm">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
};

export default PageLoading;