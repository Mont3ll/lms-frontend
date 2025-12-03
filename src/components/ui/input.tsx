import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  value?: string | number | readonly string[]
}

function Input({ className, type, value, ...props }: InputProps) {
  // Only use controlled state when value is explicitly provided
  // If value is undefined, let it be uncontrolled (for react-hook-form compatibility)
  const inputProps = value !== undefined ? { value, ...props } : props;
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...inputProps}
    />
  )
}
Input.displayName = "Input"

export { Input }
