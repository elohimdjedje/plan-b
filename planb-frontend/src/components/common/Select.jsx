import { forwardRef } from 'react';

/**
 * Composant Select avec style glassmorphism
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Sélectionner...',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-900">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-4 py-3 bg-white/80 rounded-xl 
          border-2 border-secondary-200 
          focus:border-primary-500 focus:outline-none 
          transition-all duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value || option.id} value={option.value || option.id}>
            {option.label || option.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
