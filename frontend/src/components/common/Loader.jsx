
import { ClipLoader } from "react-spinners";

const Loader = ({ size = 32, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <ClipLoader
        color="var(--color-primary)"
        size={size}
      />

      {text && (
        <p className="text-sm text-text-secondary">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
