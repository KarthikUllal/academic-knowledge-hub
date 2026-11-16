const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export default formatDate;