
import Card from "../../common/Card";
import Avatar from "../../common/Avatar";

const RecentStudents = ({ students = [] }) => {
    return (
        <Card className="border border-slate-200">

            {/* Heading */}
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900">
                    Recent Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Recently registered students
                </p>
            </div>

            {/* Student list */}
            {students.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                        No students found.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            className="flex items-center gap-3"
                        >
                            {/* Student avatar */}
                            <Avatar
                                src={student.profilePicture}
                                name={student.fullName}
                                size="md"
                            />

                            {/* Student information */}
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-medium text-slate-800">
                                    {student.fullName}
                                </h3>

                                <p className="truncate text-xs text-slate-500">
                                    {student.email}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </Card>
    );
};

export default RecentStudents;
