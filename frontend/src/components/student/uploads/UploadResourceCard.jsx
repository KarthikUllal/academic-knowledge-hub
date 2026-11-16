
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    ArrowUpRight
} from "lucide-react";

import Card from "../../common/Card";
import Badge from "../../common/Badge";

import formatDate from "../../../utils/formatDate";


const UploadResourceCard = ({ resource }) => {

    const statusDetails = {
        pending: {
            label: "Pending",
            variant: "warning",
            icon: Clock
        },
        approved: {
            label: "Approved",
            variant: "success",
            icon: CheckCircle
        },
        rejected: {
            label: "Rejected",
            variant: "danger",
            icon: XCircle
        }
    };

    const status = statusDetails[resource.status] || statusDetails.pending;
    const StatusIcon = status.icon;

    return (
        <Card padding="md">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex min-w-0 gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText size={21} />
                    </div>

                    <div className="min-w-0">

                        <h3 className="break-words font-semibold text-slate-900">
                            {resource.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {resource.subject} · {resource.course}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>{resource.category}</span>
                            <span>•</span>
                            <span>Semester {resource.semester}</span>
                            <span>•</span>
                            <span>{formatDate(resource.createdAt)}</span>
                        </div>

                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">

                    <Badge variant={status.variant}>
                        <span className="inline-flex items-center gap-1">
                            <StatusIcon size={13} />
                            {status.label}
                        </span>
                    </Badge>

                    {resource.status === "rejected" && (
                        <Link
                            to={`/student/resources/${resource._id}/edit`}
                            state={{ resource }}
                            className="inline-flex items-center gap-1  text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            <Edit size={15} />
                            Edit
                        </Link>
                    )}

                    {resource.status === "approved" && (
                        <Link
                            to={`/student/resources/${resource._id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            View
                            <ArrowUpRight size={15} />
                        </Link>
                    )}

                </div>

            </div>

            {resource.status === "rejected" && resource.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">

                    <p className="text-xs font-semibold text-red-700">
                        Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                        {resource.rejectionReason}
                    </p>

                </div>
            )}

            {resource.status === "pending" && (
                <p className="mt-3 text-xs text-amber-700">
                    Your resource is waiting for admin approval.
                </p>
            )}


        </Card>
    );
};

export default UploadResourceCard;
