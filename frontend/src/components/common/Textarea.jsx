
const Textarea = ({
    label,
    name,
    placeholder = "",
    value,
    onChange,
    rows = 4,
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

            <textarea
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
                disabled={disabled}
                className={`w-full resize-y rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors
          ${error
                        ? "border-error focus:ring-2 focus:ring-error/20"
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
          disabled:cursor-not-allowed disabled:bg-background
          ${className}`}
            />

            {error && (
                <p className="mt-1 text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Textarea;
