import React from "react";
import { useFormContext, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input"; // Import InputProps
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputProps {
  // Extend InputProps
  name: string;
  label: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  // Add other props like placeholder, type, etc., inherited from InputProps
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  className,
  labelClassName,
  inputClassName,
  type = "text", // Default type to text
  ...inputProps // Spread remaining InputProps
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // Get context from parent <Form>
  const error = errors[name] as FieldError | undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label
        htmlFor={name}
        className={cn(error && "text-destructive", labelClassName)}
      >
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        {...register(name)} // Register the field
        {...inputProps} // Pass other input props like placeholder, disabled etc.
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          inputClassName,
        )}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
};
