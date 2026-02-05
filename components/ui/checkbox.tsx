"use client"

import { cn } from "@/lib/utils"
import { Check, Minus } from "lucide-react"
import * as React from "react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          ref={ref}
          onChange={(e) => {
            onChange?.(e)
            onCheckedChange?.(e.target.checked)
          }}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-slate-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50",
            className
          )}
          {...props}
        />
        <Check className="absolute left-0 top-0 h-4 w-4 hidden peer-checked:block pointer-events-none text-white p-0.5" strokeWidth={3} />
        {indeterminate && !props.checked && (
          <Minus className="absolute left-0 top-0 h-4 w-4 pointer-events-none text-slate-900 p-0.5" strokeWidth={3} />
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
