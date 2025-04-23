"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		// Check if window is available (client-side)
		if (typeof window === "undefined") return;

		const checkAuth = async () => {
			try {
				// Check if user is logged in
				const token = localStorage.getItem("authToken");
				if (!token) {
					router.push("/login");
					return;
				}

				// Verify token with backend
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
				const response = await axios.get(`${API_BASE_URL}/users/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.data.status === "success") {
					const userData = response.data.data.user;

					// Check if user is an admin
					if (userData.role !== "ADMIN") {
						if (
							userData.role === "APPROVER" ||
							userData.role === "DepartmentHead"
						) {
							router.push("/dashboard/approver");
						} else {
							router.push("/dashboard/requester");
						}
						return;
					}

					setUser(userData);
					localStorage.setItem("user", JSON.stringify(userData));
				} else {
					localStorage.removeItem("authToken");
					localStorage.removeItem("user");
					router.push("/login");
				}
			} catch (err) {
				console.error("Authentication error:", err);
				setError("Failed to authenticate. Please log in again.");
				localStorage.removeItem("authToken");
				localStorage.removeItem("user");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} finally {
				setLoading(false);
			}
		};

		// Check if user is logged in from localStorage first
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			try {
				const userData = JSON.parse(storedUser);

				// Check if user is an admin
				if (userData.role !== "Admin") {
					router.push("/dashboard");
					return;
				}

				setUser(userData);
				setLoading(false);
			} catch (error) {
				console.error("Error parsing user data:", error);
				localStorage.removeItem("user");
				checkAuth();
			}
		} else {
			checkAuth();
		}
	}, [router]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
					<p className="text-red-500 text-center">{error}</p>
					<p className="text-gray-500 dark:text-gray-400 text-center mt-2">
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <AdminDashboard user={user} />;
}
