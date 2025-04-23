"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function EmailVerification() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");
	const [browserMismatch, setBrowserMismatch] = useState(false);
	const [expired, setExpired] = useState(false);

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setStatus("error");
				setMessage("Invalid or missing verification token.");
				return;
			}

			try {
				// Add a delay to ensure the page renders before making the request
				await new Promise((resolve) => setTimeout(resolve, 500));

				const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`;
				console.log("Making verification request to:", apiUrl);

				const response = await axios.get(apiUrl, {
					params: { token },
				});

				// Log the full response for debugging
				console.log("Verification response:", response.data);

				// Check if the response indicates success
				if (response.data.status === "success") {
					setStatus("success");
					setMessage(
						response.data.message ||
							"Your email has been successfully verified!"
					);

					// Only redirect on success after 3 seconds
					setTimeout(() => {
						router.push("/login?verified=true");
					}, 3000);
				} else {
					setStatus("error");
					setMessage(
						response.data.message || "Verification failed. Please try again."
					);
				}
			} catch (error) {
				console.error(
					"Verification error details:",
					error.response?.data || error.message
				);

				// Check if the error response indicates the email was already verified
				if (error.response?.data?.alreadyVerified) {
					setStatus("success");
					setMessage("Your email has already been verified successfully!");

					// Redirect after 3 seconds
					setTimeout(() => {
						router.push("/login?verified=true");
					}, 3000);
					return;
				}

				setStatus("error");
				let errorMessage = "Verification failed. Please try again.";

				if (error.response?.data?.message) {
					errorMessage = error.response.data.message;
				}

				// Check if it's a browser mismatch error
				if (error.response?.data?.browserMismatch) {
					setBrowserMismatch(true);
				}

				// Check if the token is expired
				if (error.response?.data?.expired) {
					setExpired(true);
				}

				setMessage(errorMessage);
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
				{status === "loading" && (
					<>
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							Verifying Email...
						</h2>
						<p className="text-gray-600">
							Please wait while we verify your email.
						</p>
					</>
				)}

				{status === "success" && (
					<>
						<div className="text-green-500 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-green-600 mb-4">
							Email Verified Successfully!
						</h2>
						<p className="text-gray-600">{message}</p>
						<p className="text-sm text-gray-500 mt-2">
							Redirecting to login page...
						</p>
					</>
				)}

				{status === "error" && (
					<>
						<div className="text-red-500 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-red-600 mb-4">
							Verification Failed
						</h2>
						<p className="text-gray-600">{message}</p>

						{browserMismatch && (
							<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-yellow-700 font-medium">
									Browser Mismatch Detected
								</p>
								<p className="text-sm text-yellow-600 mt-1">
									For security reasons, please open the verification link in the
									same browser where you requested it.
								</p>
							</div>
						)}

						{expired && (
							<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
								<p className="text-orange-700 font-medium">
									Verification Link Expired
								</p>
								<p className="text-sm text-orange-600 mt-1">
									Your verification link has expired. Please request a new
									verification email.
								</p>
							</div>
						)}

						<div className="mt-4">
							<button
								onClick={() => router.push("/login")}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Return to Login
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
