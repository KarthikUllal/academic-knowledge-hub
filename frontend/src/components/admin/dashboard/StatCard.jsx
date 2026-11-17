
import Card from "../../common/Card";

const StatCard = ({ title, value, icon: Icon, iconColor }) => {
    return (
        <Card className="flex items-center justify-between border border-slate-200">
            <div>
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {value ?? 0}
                </h2>
            </div>

            <div className={`rounded-xl p-3 ${iconColor}`}>
                <Icon size={24} />
            </div>
        </Card>
    );
};

export default StatCard;
