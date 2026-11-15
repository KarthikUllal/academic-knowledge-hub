
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        college: "",
        department: "",
        course: "",
        semester: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const semesterOptions = [
        { label: "Semester 1", value: "1" },
        { label: "Semester 2", value: "2" },
        { label: "Semester 3", value: "3" },
        { label: "Semester 4", value: "4" },
        { label: "Semester 5", value: "5" },
        { label: "Semester 6", value: "6" },
        { label: "Semester 7", value: "7" },
        { label: "Semester 8", value: "8" },
    ];

    // Update form data when an input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle registration form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Check whether all fields are filled
        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.college ||
            !formData.department ||
            !formData.course ||
            !formData.semester
        ) {
            setError("Please fill in all the fields.");
            return;
        }

        // Check password confirmation
        if (formData.password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Call the registration function from AuthContext
            await register(formData);

            // Navigate to login after successful registration
            navigate("/login", { replace: true });

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">

            <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">

                {/* Page heading */}
                <div className="mb-8 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft">
                        <GraduationCap size={32} className="text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-text-primary">
                        Create Your Account
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Join Academic Hub and access academic resources.
                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Personal information */}
                    <Input
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {/* Password */}
                    <div className="relative">

                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-text-secondary hover:text-primary"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>

                    </div>

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {/* Academic information */}
                    <div className="border-t border-border pt-5">

                        <h2 className="mb-4 text-base font-semibold text-text-primary">
                            Academic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <Input
                                label="College"
                                name="college"
                                placeholder="Enter your college"
                                value={formData.college}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Department"
                                name="department"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Course"
                                name="course"
                                placeholder="e.g. B.Tech, MCA"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                options={semesterOptions}
                                placeholder="Select semester"
                                required
                            />

                        </div>

                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-error">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <Button
                        type="submit"
                        block
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>

                </form>

                {/* Login link */}
                <p className="mt-6 text-center text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-primary hover:text-primary-dark"
                    >
                        Sign In
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Register;
