
import { ChevronDown } from "lucide-react";

const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    required = false,
    disabled = false,
    className = "",
}) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                    {label}
                    {required && <span className="ml-1 text-error">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full appearance-none rounded-lg border bg-surface px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors
            ${error
                            ? "border-error focus:ring-2 focus:ring-error/20"
                            : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }
            disabled:cursor-not-allowed disabled:bg-background
            ${className}`}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
