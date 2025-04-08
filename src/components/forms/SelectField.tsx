import React from "react";
import { useFormContext, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Shadcn select
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  placeholder,
  className,
  labelClassName,
  triggerClassName,
  disabled = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext(); // Use control for Select
  const error = errors[name] as FieldError | undefined;

  // Shadcn Select integrates with RHF Controller
  const { field } = control ? control.register(name) : { field: {} }; // Handle case where control might not be ready?
  const controllerField = control?.getFieldState(name);

  return (
    <div className={cn("grid gap-2", className)}>
      <Label
        htmlFor={name}
        className={cn(error && "text-destructive", labelClassName)}
      >
        {label}
      </Label>
      <Select
        onValueChange={field.onChange} // Use field from Controller
        defaultValue={field.value}
        disabled={disabled}
        name={name} // Pass name for accessibility/form association
      >
        <SelectTrigger
          id={name}
          className={cn(
            error && "border-destructive focus:ring-destructive",
            triggerClassName,
          )}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
};
