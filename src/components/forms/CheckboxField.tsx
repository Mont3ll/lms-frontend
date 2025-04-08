import React from "react";
import { useFormContext, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  name: string;
  label: string; // Label displayed next to checkbox
  className?: string; // Class for the outer container (div)
  checkboxClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  className,
  checkboxClassName,
  labelClassName,
  disabled = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name] as FieldError | undefined;

  return (
    <div className={cn("items-top flex space-x-2", className)}>
      <Checkbox
        id={name}
        {...register(name)}
        disabled={disabled}
        className={cn(error && "border-destructive", checkboxClassName)}
        aria-invalid={!!error}
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={name}
          className={cn(
            "font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error && "text-destructive",
            labelClassName,
          )}
        >
          {label}
        </Label>
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};
