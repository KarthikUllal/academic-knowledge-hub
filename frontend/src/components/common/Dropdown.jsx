
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({
    trigger,
    items = [],
    align = "right",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-background"
                aria-expanded={isOpen}
            >
                {trigger}
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute top-full z-50 mt-2 min-w-48 rounded-lg border border-border bg-surface py-1 shadow-lg ${align === "right" ? "right-0" : "left-0"
                        }`}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => {
                                item.onClick?.();
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm ${item.danger
                                    ? "text-error hover:bg-red-50"
                                    : "text-text-primary hover:bg-background"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
