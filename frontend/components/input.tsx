import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ElementType
  rightElement?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, rightElement, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-brand-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
            />
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              'w-full bg-brand-input border border-brand-border rounded-2xl py-3 pr-4 text-sm',
              'placeholder:text-primary-300 text-brand-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
              error && 'border-red-400 focus:ring-red-300',
              Icon ? 'pl-10' : 'pl-4',
              rightElement && 'pr-12',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p id={errorId} className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
