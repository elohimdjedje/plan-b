import { forwardRef } from 'react';

/**
 * Composant Textarea avec compteur de caractères
 */
const Textarea = forwardRef(({
  label,
  error,
  helperText,
  placeholder,
  maxLength,
  className = '',
  showCount = false,
  value = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-secondary-900">
            {label}
          </label>
          {showCount && maxLength && (
            <span className="text-xs text-secondary-500">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        className={`
          w-full px-4 py-3 bg-white/80 rounded-xl 
          border-2 border-secondary-200 
          focus:border-primary-500 focus:outline-none 
          transition-all duration-200
          placeholder:text-secondary-400
          resize-none
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-secondary-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
