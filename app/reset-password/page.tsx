"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Eye,
	EyeOff,
	Lock,
	AlertCircle,
	Loader2,
	Home,
	CheckCircle,
} from "lucide-react";
import axios from "axios";

// Password Strength Indicator component
const PasswordStrengthIndicator = ({ password }) => {
	const getStrength = () => {
		if (!password) return { strength: 0, label: "Empty" };

		let strength = 0;

		// Length check
		if (password.length >= 8) strength += 1;

		// Character variety checks
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/[0-9]/.test(password)) strength += 1;
		if (/[^A-Za-z0-9]/.test(password)) strength += 1;

		const labels = [
			"Very Weak",
			"Weak",
			"Fair",
			"Good",
			"Strong",
			"Very Strong",
		];

		return {
			strength: Math.min(strength, 5),
			label: labels[strength],
		};
	};

	const { strength, label } = getStrength();
	const percentage = (strength / 5) * 100;

	const getColor = () => {
		if (strength <= 1) return "bg-red-500";
		if (strength <= 2) return "bg-orange-500";
		if (strength <= 3) return "bg-yellow-500";
		if (strength <= 4) return "bg-green-500";
		return "bg-emerald-500";
	};

	return (
		<div className="mb-4">
			<div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
				<motion.div
					className={`h-full ${getColor()}`}
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 0.5 }}
				/>
			</div>
			<div className="flex justify-between mt-1">
				<span className="text-xs text-gray-500 dark:text-gray-400">
					Strength:
				</span>
				<span
					className={`text-xs font-medium ${getColor().replace(
						"bg-",
						"text-"
					)}`}
				>
					{label}
				</span>
			</div>
		</div>
	);
};

// Animated Input Component
const AnimatedInput = ({
	label,
	type,
	value,
	onChange,
	icon: Icon,
	showPassword,
	togglePassword,
	error,
	required = false,
}) => {
	const [isFocused, setIsFocused] = useState(false);

	return (
		<div className="relative mb-6">
			<motion.label
				className={`absolute left-3 text-sm transition-all duration-200 pointer-events-none ${
					isFocused || value
						? "-top-2.5 text-xs bg-white dark:bg-gray-900 px-1 text-blue-600 dark:text-blue-400 z-10"
						: "top-3.5 text-gray-500 dark:text-gray-400"
				}`}
				initial={false}
				animate={{
					top: isFocused || value ? -10 : 14,
					fontSize: isFocused || value ? "0.75rem" : "0.875rem",
					color: isFocused
						? "rgb(37, 99, 235)"
						: error
						? "rgb(220, 38, 38)"
						: "rgb(107, 114, 128)",
				}}
			>
				{label} {required && <span className="text-red-500">*</span>}
			</motion.label>

			<div className="relative">
				<div className="absolute left-3 top-3.5 text-gray-500 dark:text-gray-400">
					<Icon className="h-5 w-5" />
				</div>

				<input
					type={type === "password" && showPassword ? "text" : type}
					value={value}
					onChange={onChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={`w-full px-10 py-3.5 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border ${
						error
							? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
							: isFocused
							? "border-blue-500 focus:border-blue-500 focus:ring-blue-500/20"
							: "border-gray-200 dark:border-gray-700"
					} text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all`}
				/>

				{type === "password" && (
					<button
						type="button"
						onClick={togglePassword}
						className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
					>
						{showPassword ? (
							<EyeOff className="h-5 w-5" />
						) : (
							<Eye className="h-5 w-5" />
						)}
					</button>
				)}
			</div>

			{error && (
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-red-500 text-xs mt-1 flex items-center"
				>
					<AlertCircle className="h-3 w-3 mr-1" />
					{error}
				</motion.p>
			)}
		</div>
	);
};

export default function ResetPassword() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState({
		newPassword: "",
		confirmPassword: "",
		general: "",
	});

	const [showPassword, setShowPassword] = useState({
		new: false,
		confirm: false,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [darkMode, setDarkMode] = useState(false);

	// API base URL
	const API_BASE_URL =
		process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

	useEffect(() => {
		// Check for dark mode preference
		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Validate token presence
		if (!token) {
			setErrors({
				...errors,
				general:
					"Invalid or missing reset token. Please request a new password reset link.",
			});
		}
	}, []);

	const validateForm = () => {
		const newErrors = { ...errors };
		let isValid = true;

		if (!formData.newPassword) {
			newErrors.newPassword = "New password is required";
			isValid = false;
		} else if (formData.newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters";
			isValid = false;
		} else if (
			!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
				formData.newPassword
			)
		) {
			newErrors.newPassword =
				"Password must include uppercase, lowercase, number, and special character";
			isValid = false;
		} else {
			newErrors.newPassword = "";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
			isValid = false;
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
			isValid = false;
		} else {
			newErrors.confirmPassword = "";
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({ ...errors, general: "" });

		try {
			const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
				token,
				newPassword: formData.newPassword,
				confirmPassword: formData.confirmPassword,
			});

			if (response.data.status === "success") {
				setIsSuccess(true);

				// Redirect to login page after 3 seconds
				setTimeout(() => {
					router.push("/login?reset=success");
				}, 3000);
			}
		} catch (err) {
			console.error("Password reset error:", err);
			let errorMessage = "An error occurred while resetting your password";

			if (err.response && err.response.data) {
				errorMessage = err.response.data.message || errorMessage;
			}

			setErrors({ ...errors, general: errorMessage });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-blue-900 p-4 ${
				darkMode ? "dark" : ""
			}`}
		>
			{/* Back to home button */}
			<div className="absolute top-6 left-6 z-20">
				<Link
					href="/"
					className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm transition-all"
				>
					<Home className="h-4 w-4" />
					<span className="text-sm font-medium">Back to Home</span>
				</Link>
			</div>

			{/* Animated background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="w-full max-w-md relative z-10"
			>
				<div className="bg-white dark:bg-gray-900 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
					<div className="p-8">
						<div className="text-center mb-8">
							<Image
								src="/university-logo.png"
								alt="University Logo"
								width={64}
								height={64}
								className="mx-auto mb-4"
							/>

							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Reset Password
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Enter your new password below
							</p>
						</div>

						{/* Error message */}
						{errors.general && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start"
							>
								<AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
								<span>{errors.general}</span>
							</motion.div>
						)}

						{/* Success message */}
						{isSuccess ? (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center"
							>
								<CheckCircle className="h-12 w-12 mx-auto text-green-500 dark:text-green-400 mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									Password Reset Successful!
								</h3>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									Your password has been updated successfully. You can now log
									in with your new password.
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Redirecting to login page...
								</p>
							</motion.div>
						) : (
							<form onSubmit={handleResetPassword} className="space-y-2">
								<AnimatedInput
									label="New Password"
									type="password"
									value={formData.newPassword}
									onChange={(e) =>
										setFormData({ ...formData, newPassword: e.target.value })
									}
									icon={Lock}
									showPassword={showPassword.new}
									togglePassword={() =>
										setShowPassword({ ...showPassword, new: !showPassword.new })
									}
									error={errors.newPassword}
									required
								/>

								<PasswordStrengthIndicator password={formData.newPassword} />

								<AnimatedInput
									label="Confirm Password"
									type="password"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
									icon={Lock}
									showPassword={showPassword.confirm}
									togglePassword={() =>
										setShowPassword({
											...showPassword,
											confirm: !showPassword.confirm,
										})
									}
									error={errors.confirmPassword}
									required
								/>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type="submit"
									disabled={isLoading || !token}
									className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
								>
									{isLoading ? (
										<>
											<Loader2 className="h-5 w-5 mr-2 animate-spin" />
											Resetting...
										</>
									) : (
										"Reset Password"
									)}
								</motion.button>
							</form>
						)}
					</div>
				</div>

				{/* Footer */}
				<p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
					© 2024 Digital Clearance System. All rights reserved.
				</p>
			</motion.div>
		</div>
	);
}
