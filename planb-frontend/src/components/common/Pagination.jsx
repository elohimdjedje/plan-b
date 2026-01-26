import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Composant de pagination réutilisable
 * Supporte la navigation par page et l'affichage des numéros
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showPageNumbers = true,
  showFirstLast = true,
  maxPageNumbers = 5,
  className = '',
}) => {
  // Ne pas afficher si une seule page
  if (totalPages <= 1) return null;

  /**
   * Générer la liste des numéros de page à afficher
   */
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    // Ajuster si on est proche de la fin
    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info */}
      <div className="text-sm text-gray-600">
        Affichage de <span className="font-semibold">{startItem}</span> à{' '}
        <span className="font-semibold">{endItem}</span> sur{' '}
        <span className="font-semibold">{totalItems}</span> résultats
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Première page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => onPageChange(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Première page"
          >
            <ChevronsLeft size={20} />
          </button>
        )}

        {/* Page précédente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Page précédente"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Numéros de page */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {pageNumbers.map((page) => (
              <motion.button
                key={page}
                onClick={() => onPageChange(page)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all
                  ${
                    page === currentPage
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {page}
              </motion.button>
            ))}

            {/* Ellipsis si pages cachées */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </div>
        )}

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Page suivante"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dernière page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Dernière page"
          >
            <ChevronsRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
