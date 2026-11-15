
import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap,  ArrowLeft } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/forgot-password", {
                email: email,
            });

            setMessage(response.data.message);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to process your request. Please try again."
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
                        Forgot Password?
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Enter your registered email address. We'll send you a link to reset your password.
                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    <Button type="submit" block disabled={loading}>
                        {loading ? "Sending Reset Link..." : "Send Reset Link"}
                    </Button>

                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>

            </div>

        </div>
    );
};

export default ForgotPassword;
