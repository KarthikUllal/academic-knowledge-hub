
const Avatar = ({
    src,
    name = "User",
    size = "md",
    className = "",
}) => {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-lg",
        xl: "h-20 w-20 text-2xl",
    };

    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary ${sizes[size]} ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
};

export default Avatar;
