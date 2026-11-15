
import { Outlet } from "react-router-dom";
import StudentNavbar from "../components/student/StudentNavbar";

const StudentLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <StudentNavbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
