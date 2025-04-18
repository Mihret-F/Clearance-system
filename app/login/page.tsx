"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
	Loader2,
	Home,
	Sun,
	Moon,
} from "lucide-react";
import axios from "axios";

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

// Password Strength Indicator
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

// Add dark mode support to the login page
export default function Login() {
	const router = useRouter();
	const [step, setStep] = useState<
		"login" | "changePassword" | "verifyEmail" | "forgotPassword"
	>("login");
	const [currentUser, setCurrentUser] = useState(null);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		email: "",
		rememberMe: false,
		resetEmail: "",
	});
	const [errors, setErrors] = useState({
		username: "",
		password: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		email: "",
		resetEmail: "",
		general: "",
	});
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [resetEmailSent, setResetEmailSent] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [token, setToken] = useState("");

	// API base URL
	const API_BASE_URL =
		process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

	// Background animation
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		// Check for dark mode preference
		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		const handleMouseMove = (e) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	const toggleDarkMode = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem("darkMode", newMode.toString());

		if (newMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};
	const handleInputChange = (field: string, value: string) => {
		setFormData({ ...formData, [field]: value });

		// Real-time validation
		const newErrors = { ...errors };

		if (field === "username") {
			if (!value.trim()) {
				newErrors.username = "Username is required";
			} else if (value.length < 3 || value.length > 50) {
				newErrors.username = "Username must be between 3 and 50 characters";
			} else {
				newErrors.username = "";
			}
		}

		if (field === "password") {
			if (!value) {
				newErrors.password = "Password is required";
			} else if (value.length < 6) {
				newErrors.password = "Password must be at least 6 characters";
			} else {
				newErrors.password = "";
			}
		}

		setErrors(newErrors);
	};
	const validateForm = (type: string) => {
		const newErrors = { ...errors };
		let isValid = true;

		if (type === "login" || type === "all") {
			if (!formData.username.trim()) {
				newErrors.username = "Username is required";
				isValid = false;
			} else if (
				formData.username.length < 3 ||
				formData.username.length > 50
			) {
				newErrors.username = "Username must be between 3 and 50 characters";
				isValid = false;
			} else {
				newErrors.username = "";
			}

			if (!formData.password) {
				newErrors.password = "Password is required";
				isValid = false;
			} else if (formData.password.length < 6) {
				newErrors.password = "Password must be at least 6 characters";
				isValid = false;
			} else {
				newErrors.password = "";
			}
		}

		if (type === "changePassword" || type === "all") {
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
		}

		if (type === "verifyEmail" || type === "all") {
			if (!formData.email) {
				newErrors.email = "Email is required";
				isValid = false;
			} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
				newErrors.email = "Please enter a valid email";
				isValid = false;
			} else if (
				!/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com|hotmail\.com|university\.edu)$/i.test(
					formData.email
				)
			) {
				newErrors.email =
					"Please use a valid email from a known provider (Gmail, Outlook, Yahoo, Hotmail, or university.edu)";
				isValid = false;
			} else {
				newErrors.email = "";
			}
		}

		if (type === "forgotPassword" || type === "all") {
			if (!formData.resetEmail) {
				newErrors.resetEmail = "Email is required";
				isValid = false;
			} else if (!/\S+@\S+\.\S+/.test(formData.resetEmail)) {
				newErrors.resetEmail = "Please enter a valid email";
				isValid = false;
			} else {
				newErrors.resetEmail = "";
			}
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm("login")) return;

		setIsLoading(true);
		setErrors({ ...errors, general: "" });

		try {
			const response = await axios.post(`${API_BASE_URL}/auth/login`, {
				username: formData.username,
				password: formData.password,
			});

			if (response.data.status === "success") {
				const userData = response.data.data;
				setCurrentUser(userData.user);
				setToken(userData.token);

				// Store token in localStorage if rememberMe is checked
				if (formData.rememberMe) {
					localStorage.setItem("authToken", userData.token);
				}

				if (userData.isFirstLogin) {
					setStep("changePassword");
				} else if (
					!userData.emailVerified &&
					!userData.user.emailVerificationSkipped
				) {
					setStep("verifyEmail");
				} else {
					completeLogin(userData.user, userData.token);
				}
			}
		} catch (err) {
			console.error("Login error:", err);

			// Parse server-side errors
			if (err.response && err.response.data.errors) {
				const newErrors = { ...errors };
				err.response.data.errors.forEach((error: any) => {
					if (error.path === "username") {
						newErrors.username = error.msg;
					} else if (error.path === "password") {
						newErrors.password = error.msg;
					}
				});
				setErrors(newErrors);
			} else {
				// General error
				setErrors({ ...errors, general: "Invalid username or password" });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm("changePassword")) return;

		setIsLoading(true);
		setErrors({ ...errors, general: "" });

		try {
			const response = await axios.post(
				`${API_BASE_URL}/auth/change-password`,
				{
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
					confirmPassword: formData.confirmPassword,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status === "success") {
				// After password change, move to email verification
				setStep("verifyEmail");
			}
		} catch (err) {
			console.error("Password change error:", err);
			let errorMessage = "An error occurred while changing password";
			if (err.response) {
				errorMessage = err.response.data.message || errorMessage;
			}

			setErrors({ ...errors, general: errorMessage });
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm("verifyEmail")) return;

		setIsLoading(true);
		setErrors({ ...errors, general: "" });

		try {
			const response = await axios.post(
				`${API_BASE_URL}/auth/verify-email`,
				{
					email: formData.email,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status === "success") {
				setEmailSent(true);

				// Wait for 2 seconds to show the success message
				setTimeout(() => {
					completeLogin(currentUser, token);
				}, 2000);
			}
		} catch (err) {
			console.error("Email verification error:", err);
			let errorMessage = "An error occurred during email verification";

			if (err.response) {
				errorMessage = err.response.data.message || errorMessage;
			}

			setErrors({ ...errors, general: errorMessage });
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm("forgotPassword")) return;

		setIsLoading(true);
		setErrors({ ...errors, general: "" });

		try {
			const response = await axios.post(
				`${API_BASE_URL}/auth/forgot-password`,
				{
					email: formData.resetEmail,
				}
			);

			if (response.data.status === "success") {
				setResetEmailSent(true);

				// Wait to show success message
				setTimeout(() => {
					setResetEmailSent(false);
					setStep("login");
					setFormData({ ...formData, resetEmail: "" });
				}, 3000);
			}
		} catch (err) {
			console.error("Forgot password error:", err);
			let errorMessage = "Failed to send reset email. Please try again.";

			if (err.response) {
				errorMessage = err.response.data.message || errorMessage;
			}

			setErrors({ ...errors, general: errorMessage });
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = async () => {
		if (currentUser) {
			try {
				const response = await axios.post(
					`${API_BASE_URL}/auth/skip-email-verification`,
					{},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data.status === "success") {
					completeLogin(currentUser, token);
				}
			} catch (err) {
				console.error("Skip email verification error:", err);
				setErrors({ ...errors, general: "Failed to skip email verification" });
			}
		}
	};

	const completeLogin = (user, authToken) => {
		// Store user info in localStorage
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("authToken", authToken);

		// Determine redirect path based on role
		let redirectPath = "";

		// Redirect based on user role
		if (user.role === "ADMIN") {
			redirectPath = "/dashboard/admin";
		} else if (user.role === "APPROVER") {
			redirectPath = "/dashboard/approver";
		} else if (user.role === "STUDENT" || user.role === "TEACHER") {
			redirectPath = "/dashboard/requester";
		} else {
			// Default fallback
			redirectPath = "/dashboard";
		}

		router.push(redirectPath);
	};

	const goBack = () => {
		if (step === "forgotPassword") {
			setStep("login");
		} else if (step === "changePassword" || step === "verifyEmail") {
			// These steps shouldn't go back in normal flow
			// But we'll add it for testing purposes
			setStep("login");
		}
	};

	return (
		<div
			className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-blue-900 p-4 ${
				darkMode ? "dark" : ""
			}`}
		>
			{/* Back to home button */}
			<div className="absolute top-6 left-6 z-20 flex items-center gap-2">
				<Link
					href="/"
					className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm transition-all"
				>
					<Home className="h-4 w-4" />
					<span className="text-sm font-medium">Back to Home</span>
				</Link>

				<button
					onClick={toggleDarkMode}
					className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm transition-all"
				>
					{darkMode ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					)}
				</button>
			</div>

			{/* Animated background */}
			<div
				className="absolute inset-0 overflow-hidden pointer-events-none"
				style={{
					background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.15) 0%, transparent 50%)`,
				}}
			>
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

							<AnimatePresence mode="wait">
								<motion.div
									key={step}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
								>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{step === "login" && "Welcome Back"}
										{step === "changePassword" && "Change Password"}
										{step === "verifyEmail" && "Email Verification"}
										{step === "forgotPassword" && "Reset Password"}
									</h2>
									<p className="text-gray-600 dark:text-gray-400 mt-2">
										{step === "login" && "Sign in to your account"}
										{step === "changePassword" && "Please set a new password"}
										{step === "verifyEmail" &&
											"Add your email for notifications"}
										{step === "forgotPassword" && "We'll send you a reset link"}
									</p>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Back button for multi-step forms */}
						{step !== "login" && (
							<motion.button
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
								onClick={goBack}
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								Back
							</motion.button>
						)}

						{/* Error message */}
						<AnimatePresence>
							{errors.general && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start"
								>
									<AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
									<span>{errors.general}</span>
								</motion.div>
							)}
						</AnimatePresence>

						<AnimatePresence mode="wait">
							<motion.div
								key={step}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
							>
								{/* Login Form */}
								{step === "login" && (
									<form onSubmit={handleLogin} className="space-y-2">
										<AnimatedInput
											label="Username"
											type="text"
											value={formData.username}
											onChange={(e) =>
												handleInputChange("username", e.target.value)
											}
											icon={User}
											error={errors.username}
											required
										/>

										<AnimatedInput
											label="Password"
											type="password"
											value={formData.password}
											onChange={(e) =>
												handleInputChange("password", e.target.value)
											}
											icon={Lock}
											showPassword={showPassword.current}
											togglePassword={() =>
												setShowPassword({
													...showPassword,
													current: !showPassword.current,
												})
											}
											error={errors.password}
											required
										/>

										<div className="flex items-center justify-between mt-2 mb-6">
											<div className="flex items-center">
												<input
													id="remember-me"
													type="checkbox"
													checked={formData.rememberMe}
													onChange={(e) =>
														setFormData({
															...formData,
															rememberMe: e.target.checked,
														})
													}
													className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
												/>
												<label
													htmlFor="remember-me"
													className="ml-2 text-sm text-gray-600 dark:text-gray-400"
												>
													Remember me
												</label>
											</div>

											<button
												type="button"
												onClick={() => setStep("forgotPassword")}
												className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
											>
												Forgot password?
											</button>
										</div>

										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											type="submit"
											disabled={isLoading}
											className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
										>
											{isLoading ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													Signing in...
												</>
											) : (
												"Sign in"
											)}
										</motion.button>
									</form>
								)}

								{/* Change Password Form */}
								{step === "changePassword" && (
									<form onSubmit={handlePasswordChange} className="space-y-2">
										<AnimatedInput
											label="New Password"
											type="password"
											value={formData.newPassword}
											onChange={(e) =>
												setFormData({
													...formData,
													newPassword: e.target.value,
												})
											}
											icon={Lock}
											showPassword={showPassword.new}
											togglePassword={() =>
												setShowPassword({
													...showPassword,
													new: !showPassword.new,
												})
											}
											error={errors.newPassword}
											required
										/>

										<PasswordStrengthIndicator
											password={formData.newPassword}
										/>

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
											disabled={isLoading}
											className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
										>
											{isLoading ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													Updating...
												</>
											) : (
												"Update Password"
											)}
										</motion.button>
									</form>
								)}

								{/* Email Verification Form */}
								{step === "verifyEmail" && (
									<form
										onSubmit={handleEmailVerification}
										className="space-y-2"
									>
										<AnimatedInput
											label="Email Address"
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											icon={Mail}
											error={errors.email}
											required
										/>

										<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
											We'll send you notifications about your clearance status
										</p>

										{emailSent && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4"
											>
												<div className="flex items-center">
													<CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
													<p className="text-green-700 dark:text-green-400 font-medium">
														Verification email sent!
													</p>
												</div>
												<p className="text-green-600/80 dark:text-green-500/80 text-sm mt-1">
													Please check your inbox. Redirecting to dashboard...
												</p>
											</motion.div>
										)}

										<div className="space-y-3 mt-4">
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												type="submit"
												disabled={isLoading || emailSent}
												className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
											>
												{isLoading ? (
													<>
														<Loader2 className="h-5 w-5 mr-2 animate-spin" />
														Verifying...
													</>
												) : emailSent ? (
													<>
														<CheckCircle className="h-5 w-5 mr-2" />
														Redirecting...
													</>
												) : (
													"Verify Email"
												)}
											</motion.button>

											<button
												type="button"
												onClick={handleSkip}
												disabled={emailSent || isLoading}
												className="w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
											>
												Skip for now
											</button>
										</div>
									</form>
								)}

								{/* Forgot Password Form */}
								{step === "forgotPassword" && (
									<form onSubmit={handleForgotPassword} className="space-y-2">
										<AnimatedInput
											label="Email Address"
											type="email"
											value={formData.resetEmail}
											onChange={(e) =>
												setFormData({ ...formData, resetEmail: e.target.value })
											}
											icon={Mail}
											error={errors.resetEmail}
											required
										/>

										<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
											Enter your email address and we'll send you a link to
											reset your password
										</p>

										{resetEmailSent && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4"
											>
												<div className="flex items-center">
													<CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
													<p className="text-green-700 dark:text-green-400 font-medium">
														Reset email sent!
													</p>
												</div>
												<p className="text-green-600/80 dark:text-green-500/80 text-sm mt-1">
													Please check your inbox for instructions to reset your
													password.
												</p>
											</motion.div>
										)}

										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											type="submit"
											disabled={isLoading || resetEmailSent}
											className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
										>
											{isLoading ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													Sending...
												</>
											) : resetEmailSent ? (
												<>
													<CheckCircle className="h-5 w-5 mr-2" />
													Email Sent
												</>
											) : (
												"Send Reset Link"
											)}
										</motion.button>
									</form>
								)}
							</motion.div>
						</AnimatePresence>
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
