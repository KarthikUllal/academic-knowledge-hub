
import { useEffect, useMemo, useState } from "react";
import {
    Users,
    Eye,
    Trash2,
    UserCheck,
    UserX,
    Loader2,
    XCircle
} from "lucide-react";
import { toast } from "sonner";

import {
    getAllUsers,
    getUserById,
    updateStudentStatus,
    deleteStudent
} from "../../services/admin.service";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import formatDate from "../../utils/formatDate";

const ManageUsers = () => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    // Track the user currently being processed
    const [actionLoading, setActionLoading] = useState(null);

    // Student details dialog
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);


    // Fetch all students
    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await getAllUsers();

            setUsers(response.data.users || []);

        } catch (error) {
            console.error("Fetch users error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load students"
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);


    // Filter students by status and search term
    const filteredUsers = useMemo(() => {

        return users.filter((user) => {

            const matchesStatus =
                activeFilter === "all" ||
                (activeFilter === "active" && user.isActive) ||
                (activeFilter === "inactive" && !user.isActive);

            const searchText = searchTerm.toLowerCase();

            const matchesSearch = [
                user.fullName,
                user.email,
                user.college,
                user.course,
                user.studentId
            ].some((value) =>
                value?.toLowerCase().includes(searchText)
            );

            return matchesStatus && matchesSearch;
        });

    }, [users, activeFilter, searchTerm]);


    // Get badge variant based on account status
    const getStatusVariant = (isActive) => {
        return isActive ? "success" : "danger";
    };


    // View student details
    const handleViewUser = async (userId) => {
        try {
            setSelectedUser(null);
            setDetailsLoading(true);

            const response = await getUserById(userId);

            setSelectedUser(response.data.user);

        } catch (error) {
            console.error("Fetch student details error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load student details"
            );

        } finally {
            setDetailsLoading(false);
        }
    };


    // Close student details dialog
    const closeDetails = () => {
        setSelectedUser(null);
    };


    // Activate or deactivate a student
    const handleToggleStatus = async (user) => {

        const newStatus = !user.isActive;

        const action = newStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.fullName}'s account?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(user._id);

            await updateStudentStatus(user._id, newStatus);

            toast.success(
                `Student account ${newStatus ? "activated" : "deactivated"} successfully`
            );

            await fetchUsers();

            // Update selected user details if the dialog is open
            setSelectedUser((previousUser) =>
                previousUser?._id === user._id
                    ? { ...previousUser, isActive: newStatus }
                    : previousUser
            );

        } catch (error) {
            console.error("Update student status error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update student status"
            );

        } finally {
            setActionLoading(null);
        }
    };


    // Delete student account
    const handleDeleteUser = async (user) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.fullName}'s account?\n\nAll resources uploaded by this student will also be deleted. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionLoading(user._id);

            await deleteStudent(user._id);

            toast.success("Student account deleted successfully");

            // Close details dialog if the deleted student is open
            if (selectedUser?._id === user._id) {
                closeDetails();
            }

            await fetchUsers();

        } catch (error) {
            console.error("Delete student error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete student"
            );

        } finally {
            setActionLoading(null);
        }
    };


    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Manage Users
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    View and manage registered students.
                </p>
            </div>


            {/* Filters and search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Account status filters */}
                <div className="flex flex-wrap gap-2">

                    {[
                        { label: "All", value: "all" },
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" }
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setActiveFilter(filter.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeFilter === filter.value
                                    ? "bg-indigo-600 text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}

                </div>


                {/* Search using reusable Input */}
                <div className="w-full sm:max-w-xs">

                    <Input
                        name="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search students..."
                    />

                </div>

            </div>


            {/* Students table */}
            <Card
                padding="none"
                className="overflow-hidden border border-slate-200"
            >

                {loading ? (

                    <div className="flex justify-center py-16">
                        <Loader2
                            size={26}
                            className="animate-spin text-indigo-600"
                        />
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="py-16 text-center">

                        <Users
                            size={36}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <h3 className="font-medium text-slate-800">
                            No students found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or status filter.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px] text-left">

                            <thead className="bg-slate-50">
                                <tr>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        College
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Course
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Semester
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Joined Date
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>

                                </tr>
                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {filteredUsers.map((user) => {

                                    const isProcessing =
                                        actionLoading === user._id;

                                    return (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-slate-50"
                                        >

                                            {/* Student information */}
                                            <td className="px-5 py-4">

                                                <p className="text-sm font-medium text-slate-800">
                                                    {user.fullName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {user.email}
                                                </p>

                                            </td>


                                            {/* College */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {user.college || "—"}
                                            </td>


                                            {/* Course */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {user.course || "—"}
                                            </td>


                                            {/* Semester */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {user.semester
                                                    ? `Semester ${user.semester}`
                                                    : "—"
                                                }
                                            </td>


                                            {/* Registration date */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(user.createdAt)}
                                            </td>


                                            {/* Account status */}
                                            <td className="px-5 py-4">

                                                <Badge
                                                    variant={getStatusVariant(user.isActive)}
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </Badge>

                                            </td>


                                            {/* Actions */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    {/* View student */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleViewUser(user._id)
                                                        }
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </Button>


                                                    {/* Activate / Deactivate */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleToggleStatus(user)
                                                        }
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                        ) : user.isActive ? (
                                                            <UserX size={15} />
                                                        ) : (
                                                            <UserCheck size={15} />
                                                        )}

                                                        {user.isActive
                                                            ? "Deactivate"
                                                            : "Activate"
                                                        }
                                                    </Button>


                                                    {/* Delete student */}
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleDeleteUser(user)
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                        Delete
                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </Card>


            {/* Results count */}
            {!loading && (
                <p className="text-sm text-slate-500">
                    Showing {filteredUsers.length} of {users.length} students
                </p>
            )}


            {/* Student details dialog */}
            {(selectedUser || detailsLoading) && (

                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">

                        {/* Dialog header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:px-6">

                            <h2 className="text-lg font-semibold text-slate-900">
                                Student Details
                            </h2>

                            <button
                                type="button"
                                onClick={closeDetails}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                aria-label="Close details"
                            >
                                <XCircle size={23} />
                            </button>

                        </div>


                        {/* Dialog content */}
                        <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">

                            {detailsLoading ? (

                                <div className="flex justify-center py-12">
                                    <Loader2
                                        size={28}
                                        className="animate-spin text-indigo-600"
                                    />
                                </div>

                            ) : selectedUser && (

                                <div className="space-y-5">

                                    {/* Profile information */}
                                    <div className="flex items-center gap-4">

                                        {selectedUser.profilePicture ? (
                                            <img
                                                src={selectedUser.profilePicture}
                                                alt={selectedUser.fullName}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-xl font-semibold text-indigo-600">
                                                {selectedUser.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {selectedUser.fullName}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {selectedUser.email}
                                            </p>

                                            <div className="mt-2">
                                                <Badge
                                                    variant={getStatusVariant(selectedUser.isActive)}
                                                >
                                                    {selectedUser.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>

                                    </div>


                                    {/* Academic information */}
                                    <div>

                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            Academic Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    College
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.college || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Department
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.department || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Course
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.course || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Semester
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.semester || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Student ID
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.studentId || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Graduation Year
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800">
                                                    {selectedUser.graduationYear || "—"}
                                                </p>
                                            </div>

                                        </div>

                                    </div>


                                    {/* Bio */}
                                    <div>
                                        <h3 className="mb-2 text-sm font-semibold text-slate-800">
                                            Bio
                                        </h3>

                                        <p className="text-sm text-slate-600">
                                            {selectedUser.bio || "No bio available"}
                                        </p>
                                    </div>


                                    {/* Account information */}
                                    <div>

                                        <h3 className="mb-2 text-sm font-semibold text-slate-800">
                                            Account Information
                                        </h3>

                                        <p className="text-sm text-slate-600">
                                            Registered on:{" "}
                                            {formatDate(selectedUser.createdAt)}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* Dialog footer */}
                        <div className="flex justify-end border-t border-slate-200 p-4 sm:px-6">

                            <Button
                                variant="outline"
                                onClick={closeDetails}
                            >
                                Close
                            </Button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default ManageUsers;
