"use client"; // Date picker often requires client components

import React from "react";
import { useFormContext, Controller, FieldError } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DatePickerFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean | ((date: Date) => boolean); // Allow disabling specific dates
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  name,
  label,
  placeholder = "Pick a date",
  className,
  labelClassName,
  disabled = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name] as FieldError | undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label
        htmlFor={name}
        className={cn(error && "text-destructive", labelClassName)}
      >
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                  error && "border-destructive focus-visible:ring-destructive",
                )}
                id={name} // Associate label correctly
                disabled={typeof disabled === "boolean" ? disabled : false} // Disable button if needed
                aria-invalid={!!error}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabled} // Pass disabled function or boolean to Calendar
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
};
