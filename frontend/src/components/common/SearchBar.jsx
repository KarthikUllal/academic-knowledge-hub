
import { Search, X } from "lucide-react";

const SearchBar = ({
    value,
    onChange,
    placeholder = "Search...",
    onSubmit,
    className = "",
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className}`}
        >
            <Search size={20} className="shrink-0 text-text-secondary" />

            <input
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary [&::-webkit-search-cancel-button]:hidden"
            />

            {value && (
                <button
                    type="button"
                    onClick={() => onChange({ target: { value: "" } })}
                    className="shrink-0 text-text-secondary hover:text-text-primary"
                    aria-label="Clear search"
                >
                    <X size={18} />
                </button>
            )}
        </form>
    );
};

export default SearchBar;
