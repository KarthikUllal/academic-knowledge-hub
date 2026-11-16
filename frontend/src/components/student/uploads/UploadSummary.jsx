
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import Card from "../../common/Card";

const UploadSummary = ({ resources }) => {

    const total = resources.length;

    const pending = resources.filter(
        (resource) => resource.status === "pending"
    ).length;

    const approved = resources.filter(
        (resource) => resource.status === "approved"
    ).length;

    const rejected = resources.filter(
        (resource) => resource.status === "rejected"
    ).length;

    const summaryItems = [
        {
            label: "Total Uploads",
            value: total,
            icon: FileText,
            iconStyle: "bg-indigo-50 text-indigo-600"
        },
        {
            label: "Pending",
            value: pending,
            icon: Clock,
            iconStyle: "bg-amber-50 text-amber-600"
        },
        {
            label: "Approved",
            value: approved,
            icon: CheckCircle,
            iconStyle: "bg-green-50 text-green-600"
        },
        {
            label: "Rejected",
            value: rejected,
            icon: XCircle,
            iconStyle: "bg-red-50 text-red-600"
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {summaryItems.map((item) => {
                const Icon = item.icon;

                return (
                    <Card key={item.label} padding="md">

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                {item.label}
                            </p>

                            <div className={`rounded-lg p-2 ${item.iconStyle}`}>
                                <Icon size={19} />
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                            {item.value}
                        </p>

                    </Card>
                );
            })}

        </div>
    );
};

export default UploadSummary;
