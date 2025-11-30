"use client";

import React, { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import classNames from "classnames";
import { CaretDown, Check } from "@phosphor-icons/react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  className,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={classNames("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={classNames(
              "relative w-full px-4 py-3 bg-surface-900/50 border rounded-xl text-left transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
                : "border-surface-700 focus:border-primary-500 focus:ring-primary-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={classNames(
                "block truncate",
                selectedOption ? "text-surface-100" : "text-surface-500"
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
              <CaretDown className="w-5 h-5" weight="bold" />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-surface-800 border border-surface-700 py-1 shadow-xl focus:outline-none">
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    classNames(
                      "relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors",
                      active && "bg-surface-700",
                      selected && "text-primary-400",
                      !selected && !active && "text-surface-200",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={classNames(
                          "block truncate",
                          selected && "font-medium"
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-400">
                          <Check className="w-5 h-5" weight="bold" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="mt-1.5 text-sm text-danger-400">{error}</p>}
    </div>
  );
};

export default Select;
