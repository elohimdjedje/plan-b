import { forwardRef, useState, isValidElement, createElement } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Composant Input réutilisable avec effet glassmorphism
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  placeholder,
  icon,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-900">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
            {isValidElement(icon) ? icon : createElement(icon, { size: 18 })}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 bg-white/50 backdrop-blur-lg rounded-xl 
            border-2 border-white/30 
            focus:border-primary-500/60 focus:bg-white/60 focus:outline-none 
            transition-all duration-200
            placeholder:text-secondary-400
            shadow-sm
            ${icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-secondary-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
