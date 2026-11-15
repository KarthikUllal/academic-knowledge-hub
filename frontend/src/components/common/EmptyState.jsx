
import { FileSearch } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  title = "Nothing here yet",
  description = "There is no data to display.",
  actionLabel,
  onAction,
  icon: Icon = FileSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={28} />
      </div>

      <h3 className="text-lg font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
