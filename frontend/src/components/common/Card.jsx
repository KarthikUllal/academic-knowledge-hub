
const Card = ({
    children,
    className = "",
    padding = "md",
    shadow = false,
}) => {
    const paddings = {
        none: "",
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
    };

    return (
        <div
            className={`rounded-xl border border-border bg-surface ${shadow ? "shadow-sm" : ""
                } ${paddings[padding]} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
