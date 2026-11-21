import { useEffect, useRef, useState } from "react";
import {
    Camera,
    UserRound,
    GraduationCap,
    Save,
    X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
    getUserProfile,
    updateUserProfile,
    updateProfilePicture,
} from "../../services/user.service";

import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";

const emptyProfile = {
    fullName: "",
    college: "",
    department: "",
    course: "",
    semester: "",
    studentId: "",
    graduationYear: "",
    bio: "",
};

const MyProfile = () => {
    const { checkAuth } = useAuth();

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(emptyProfile);
    const [formData, setFormData] = useState(emptyProfile);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch profile details
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getUserProfile();
            const user = response.data.user;

            const userData = {
                fullName: user.fullName || "",
                college: user.college || "",
                department: user.department || "",
                course: user.course || "",
                semester: user.semester ?? "",
                studentId: user.studentId || "",
                graduationYear: user.graduationYear ?? "",
                bio: user.bio || "",
            };

            setProfile(user);
            setFormData(userData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save profile details
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                ...formData,
                semester: formData.semester === ""
                    ? undefined
                    : Number(formData.semester),
                graduationYear: formData.graduationYear === ""
                    ? undefined
                    : Number(formData.graduationYear),
            };

            const response = await updateUserProfile(payload);

            if (response.data.user) {
                setProfile(response.data.user);
            }

            await checkAuth();

            setSuccess("Your profile has been updated successfully.");
            await fetchProfile();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // Reset unsaved changes
    const handleCancel = () => {
        setFormData({
            fullName: profile.fullName || "",
            college: profile.college || "",
            department: profile.department || "",
            course: profile.course || "",
            semester: profile.semester ?? "",
            studentId: profile.studentId || "",
            graduationYear: profile.graduationYear ?? "",
            bio: profile.bio || "",
        });

        setError("");
        setSuccess("");
    };

    // Upload profile picture
    const handlePictureChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            e.target.value = "";
            return;
        }

        try {
            setUploadingPicture(true);
            setError("");
            setSuccess("");

            const response = await updateProfilePicture(file);

            if (response.data.user) {
                setProfile(response.data.user);
            }

            await checkAuth();

            setSuccess("Profile picture updated successfully.");
            await fetchProfile();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to upload profile picture. Please try again."
            );
        } finally {
            setUploadingPicture(false);
            e.target.value = "";
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error && !profile._id) {
        return (
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <p className="mb-4 text-sm text-error">{error}</p>
                <Button onClick={fetchProfile}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">
                    My Profile
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Manage your personal and academic information.
                </p>
            </div>

            {/* Profile header */}
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row">

                    <div className="relative">
                        <Avatar
                            src={profile.profilePicture}
                            name={profile.fullName}
                            size="xl"
                            className="h-24 w-24 text-2xl"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                            aria-label="Change profile picture"
                        >
                            {uploadingPicture ? (
                                <span className="text-xs">...</span>
                            ) : (
                                <Camera size={17} />
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            className="hidden"
                        />
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-semibold text-text-primary">
                            {profile.fullName}
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            {profile.email}
                        </p>

                        <p className="mt-1 text-sm capitalize text-primary">
                            {profile.role}
                        </p>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                            className="mt-3 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                        >
                            {uploadingPicture
                                ? "Uploading..."
                                : "Change profile picture"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm text-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Profile form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal information */}
                <section className="rounded-xl border border-border bg-surface p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-primary-soft p-2 text-primary">
                            <UserRound size={20} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-text-primary">
                                Personal Information
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Your basic account details.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email Address"
                            value={profile.email || ""}
                            disabled
                        />

                        <Input
                            label="Student ID"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder="Enter your student ID"
                        />

                        <Input
                            label="Graduation Year"
                            name="graduationYear"
                            type="number"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            placeholder="e.g. 2027"
                        />
                    </div>

                    <div className="mt-5">
                        <Textarea
                            label="About Me"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Write a little about yourself..."
                            rows={4}
                        />
                    </div>
                </section>

                {/* Academic information */}
                <section className="rounded-xl border border-border bg-surface p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-primary-soft p-2 text-primary">
                            <GraduationCap size={20} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-text-primary">
                                Academic Information
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Your college and course details.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="College"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Course"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Current Semester"
                            name="semester"
                            type="number"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </section>

                {/* Form actions */}
                <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        <X size={17} />
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={saving || uploadingPicture}
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MyProfile;