
import Input from "../../common/Input";
import Select from "../../common/Select";

const UploadFilters = ({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories
}) => {

    const statusOptions = [
        { label: "All Statuses", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" }
    ];

    const categoryOptions = [
        { label: "All Categories", value: "all" },
        ...categories.map((category) => ({
            label: category,
            value: category
        }))
    ];

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <Input
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or subject..."
            />

            <Select
                name="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
            />

            <Select
                name="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
            />

        </div>
    );
};

export default UploadFilters;
