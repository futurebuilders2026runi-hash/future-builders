"use client";

import type { ReactNode } from "react";

export function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: ReactNode;
  optional?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {optional && (
        <span className="ms-1.5 font-normal text-(--muted-fg)">
          ({optional})
        </span>
      )}
    </label>
  );
}

export function Text({
  id,
  name,
  label,
  type = "text",
  required,
  optional,
  placeholder,
  dir,
  autoComplete,
  maxLength,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <Label htmlFor={id} optional={!required ? optional : undefined}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        dir={dir}
        maxLength={maxLength}
        autoComplete={
          autoComplete ?? (type === "email" ? "email" : type === "tel" ? "tel" : undefined)
        }
        className="field"
      />
    </div>
  );
}

export function TextArea({
  id,
  name,
  label,
  required,
  optional,
  placeholder,
  rows = 4,
  maxLength,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} optional={!required ? optional : undefined}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="field resize-y"
      />
      {hint && <p id={`${id}-hint`} className="mt-2 text-sm text-(--muted-fg)">{hint}</p>}
    </div>
  );
}

export function Select({
  id,
  name,
  label,
  options,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  label: string;
  options: (string | { value: string; label: string })[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        className="field"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
    </div>
  );
}

export function RadioGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <fieldset>
      <legend className="field-label mx-auto md:mx-0">{label}</legend>
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {options.map((option, i) => (
          <label
            key={option}
            className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm transition-colors has-checked:border-accent has-checked:bg-accent/8 has-checked:text-accent"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={i === 0}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
