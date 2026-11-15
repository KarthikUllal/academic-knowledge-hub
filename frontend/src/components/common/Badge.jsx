
const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-slate-100 text-slate-700",
        primary: "bg-primary-soft text-primary",
        success: "bg-green-100 text-success",
        warning: "bg-amber-100 text-warning",
        danger: "bg-red-100 text-error",
        info: "bg-blue-100 text-info",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
