import React from "react";
import { useFormContext, FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends Omit<React.ComponentProps<"input">, "name"> {
  name: string;
  label: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  className,
  labelClassName,
  inputClassName,
  type = "text",
  ...inputProps
}) => {
  const formContext = useFormContext();

  // Handle case where form context is not available
  if (!formContext) {
    console.error(
      `FormField "${name}": useFormContext() returned null. Make sure FormField is wrapped in a FormProvider.`
    );
    return (
      <div className={cn("grid gap-2", className)}>
        <Label
          htmlFor={name}
          className={cn("text-destructive", labelClassName)}
        >
          {label}
        </Label>
        <Input
          id={name}
          type={type}
          {...inputProps}
          className={cn(
            "border-destructive focus-visible:ring-destructive",
            inputClassName
          )}
          disabled
        />
        <p className="text-sm font-medium text-destructive">
          Form context not available. Component must be wrapped in FormProvider.
        </p>
      </div>
    );
  }

  const {
    register,
    formState: { errors },
  } = formContext;

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
        {...register(name)}
        {...inputProps}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          inputClassName
        )}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
};
