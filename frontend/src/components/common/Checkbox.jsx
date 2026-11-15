
const Checkbox = ({
    label,
    name,
    checked,
    onChange,
    disabled = false,
    error,
    className = "",
}) => {
    return (
        <div className="w-full">
            <label className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}>
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="h-4 w-4 cursor-pointer rounded border-border accent-primary focus:ring-2 focus:ring-primary/20"
                />

                {label && (
                    <span className="text-sm text-text-primary">
                        {label}
                    </span>
                )}
            </label>

            {error && (
                <p className="mt-1 text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Checkbox;
