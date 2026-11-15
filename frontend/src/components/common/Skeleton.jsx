
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoader = ({
    count = 1,
    height = 20,
    width = "100%",
    circle = false,
    className = "",
}) => {
    return (
        <Skeleton
            count={count}
            height={height}
            width={width}
            circle={circle}
            className={className}
        />
    );
};

export default SkeletonLoader;
