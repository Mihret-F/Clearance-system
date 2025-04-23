"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function EmailVerification() {
	const router = useRouter();
	const { token, fingerprint } = router.query;

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token || !fingerprint) {
				setStatus("error");
				setMessage("Invalid or missing verification token.");
				return;
			}

			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
					{
						params: { token, fingerprint },
					}
				);

				if (response.status === 200) {
					setStatus("success");
					setMessage("Your email has been successfully verified!");
					setTimeout(() => {
						router.push("/login");
					}, 3000);
				}
			} catch (error) {
				console.error("Verification error:", error);
				setStatus("error");
				setMessage(
					"Verification failed. Please ensure you are using the same browser or contact support."
				);
			}
		};

		verifyEmail();
	}, [token, fingerprint, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
				{status === "loading" && (
					<>
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
						<h2 className="text-2xl font-bold text-green-600 mb-4">
							Verification Successful!
						</h2>
						<p className="text-gray-600">{message}</p>
					</>
				)}

				{status === "error" && (
					<>
						<h2 className="text-2xl font-bold text-red-600 mb-4">
							Verification Failed
						</h2>
						<p className="text-gray-600">{message}</p>
					</>
				)}
			</div>
		</div>
	);
}
