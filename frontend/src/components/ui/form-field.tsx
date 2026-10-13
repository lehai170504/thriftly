"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  help?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactElement<React.ComponentProps<"input"> | React.ComponentProps<"textarea">>;
  className?: string;
};

function FormField({ id, label, required, help, error, children, className }: FormFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}{required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (bắt buộc)</span>}
      </Label>
      {React.cloneElement(children, {
        id,
        required,
        "aria-invalid": Boolean(error) || undefined,
        "aria-describedby": describedBy,
      })}
      {help && <p id={helpId} className="text-xs text-muted-foreground">{help}</p>}
      {error && <p id={errorId} role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

type NumericFieldProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  id: string;
  label: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
};

function NumberField({ id, label, help, error, required, className, ...props }: NumericFieldProps) {
  return (
    <FormField id={id} label={label} help={help} error={error} required={required}>
      <Input type="number" inputMode="numeric" className={cn("font-numeric", className)} {...props} />
    </FormField>
  );
}

function MoneyField({ id, label, help, error, required, className, ...props }: NumericFieldProps) {
  return (
    <FormField id={id} label={label} help={help} error={error} required={required}>
      <Input type="number" inputMode="decimal" min={0} step={1000} className={cn("font-numeric", className)} {...props} />
    </FormField>
  );
}

export { FormField, MoneyField, NumberField };
