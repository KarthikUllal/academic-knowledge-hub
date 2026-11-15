
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { resetPasswordRequest } from "../../services/auth.service";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!password || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await resetPasswordRequest(token, password);

            navigate("/login", {
                replace: true,
                state: {
                    message: "Password reset successful. Please log in.",
                },
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft">
                        <GraduationCap size={32} className="text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-text-primary">
                        Reset Your Password
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <Input
                        label="New Password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-error">
                            {error}
                        </div>
                    )}

                    <Button type="submit" block disabled={loading}>
                        {loading ? "Updating Password..." : "Reset Password"}
                    </Button>

                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                    Remember your password?{" "}
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

export default ResetPassword;
