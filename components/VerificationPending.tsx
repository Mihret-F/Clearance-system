"use client";

interface VerificationPendingProps {
	email: string;
}

export default function VerificationPending({
	email,
}: VerificationPendingProps) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
				<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
					Check Your Email
				</h2>
				<p className="text-gray-600 dark:text-gray-300 mb-4">
					We've sent a verification link to: <strong>{email}</strong>
				</p>
				<p className="text-gray-600 dark:text-gray-300 mb-4">
					Please check your email and click the verification link to complete
					your registration. Make sure to use the same browser for verification.
				</p>
				<a
					href={`https://${email.split("@")[1]}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 dark:text-blue-400 hover:underline"
				>
					Go to {email.split("@")[1]}
				</a>
				<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Didn't receive the email? Check your spam folder or{" "}
						<span className="text-blue-600 dark:text-blue-400 font-medium">
							resend the email.
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
