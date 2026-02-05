import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      showPasswordToggle,
      isPasswordVisible,
      onPasswordToggle,
      className,
      type,
      ...props
    },
    ref
  ) => {
    const inputType = showPasswordToggle
      ? isPasswordVisible
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              'form-label',
              error && 'text-destructive'
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              'form-input',
              icon && 'pl-10',
              showPasswordToggle && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive/20',
              className
            )}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        {error && (
          <div className="form-error">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {helperText && !error && (
          <p className="form-helper">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
