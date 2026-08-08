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
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
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
        autoComplete={
          type === "email" ? "email" : type === "tel" ? "tel" : undefined
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
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: string;
  placeholder?: string;
  rows?: number;
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
        className="field resize-y"
      />
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
  options: string[];
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
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
      <legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
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
