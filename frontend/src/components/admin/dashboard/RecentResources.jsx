
import { FileText } from "lucide-react";

import Card from "../../common/Card";
import Badge from "../../common/Badge";

const RecentResources = ({ resources = [] }) => {
    return (
        <Card className="border border-slate-200">

            {/* Heading */}
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900">
                    Recent Resources
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Latest resources uploaded by students
                </p>
            </div>

            {/* Resource list */}
            {resources.length === 0 ? (
                <div className="py-8 text-center">
                    <FileText
                        size={32}
                        className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm text-slate-500">
                        No resources found.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {resources.map((resource) => (
                        <div
                            key={resource._id}
                            className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                        >
                            {/* Resource information */}
                            <div className="flex min-w-0 items-center gap-3">

                                <div className="shrink-0 rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                                    <FileText size={20} />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-medium text-slate-800">
                                        {resource.title}
                                    </h3>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                        Uploaded by{" "}
                                        {resource.uploadedBy?.fullName || "Unknown"}
                                    </p>
                                </div>
                            </div>

                            {/* Resource status */}
                            <Badge
                                variant={
                                    resource.status === "approved"
                                        ? "success"
                                        : resource.status === "rejected"
                                        ? "danger"
                                        : "warning"
                                }
                            >
                                {resource.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}

        </Card>
    );
};

export default RecentResources;
