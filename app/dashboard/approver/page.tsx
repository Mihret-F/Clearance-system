"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApproverDashboard from "@/components/dashboard/ApproverDashboard";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function ApproverPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [user, setUser] = useState(null);
	const [clearanceRequests, setClearanceRequests] = useState([]);
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

					// Check if user is an approver
					if (
						userData.role !== "APPROVER" &&
						userData.role !== "DepartmentHead"
					) {
						if (userData.role === "ADMIN") {
							router.push("/dashboard/admin");
						} else {
							router.push("/dashboard/requester");
						}
						return;
					}

					setUser(userData);
					localStorage.setItem("user", JSON.stringify(userData));

					// Load clearance requests
					try {
						const requestsResponse = await axios.get(
							`${API_BASE_URL}/approver/requests`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							}
						);

						if (requestsResponse.data.status === "success") {
							setClearanceRequests(requestsResponse.data.data.requests);
						}
					} catch (reqErr) {
						console.error("Error loading clearance requests:", reqErr);
						// Fallback to sample data if API fails
						const storedRequests = localStorage.getItem("clearanceRequests");
						if (storedRequests) {
							setClearanceRequests(JSON.parse(storedRequests));
						} else {
							// Use sample data from the original file
							const sampleRequests = [
								{
									id: "req-001",
									type: "Graduation Clearance",
									userId: "STU12345",
									submittedAt: new Date(
										Date.now() - 3 * 24 * 60 * 60 * 1000
									).toISOString(),
									status: "Pending",
									currentApprover: "DepartmentHead",
									approvalChain: [
										"DepartmentHead",
										"Library",
										"Finance",
										"Registrar",
									],
									documents: [
										"Transcript.pdf",
										"ID Card.jpg",
										"Fee Receipt.pdf",
									],
									description:
										"Graduation clearance request for Computer Science department",
									priority: 2,
								},
								// ... other sample requests from the original file
							];
							setClearanceRequests(sampleRequests);
							localStorage.setItem(
								"clearanceRequests",
								JSON.stringify(sampleRequests)
							);
						}
					}
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

				// Check if user is an approver
				if (
					userData.role !== "DepartmentHead" &&
					userData.role !== "Approver"
				) {
					router.push("/dashboard/requester");
					return;
				}

				setUser(userData);

				// Load clearance requests from localStorage
				const storedRequests = localStorage.getItem("clearanceRequests");
				if (storedRequests) {
					setClearanceRequests(JSON.parse(storedRequests));
				} else {
					// Sample data (same as in the original file)
					const sampleRequests = [
						{
							id: "req-001",
							type: "Graduation Clearance",
							userId: "STU12345",
							submittedAt: new Date(
								Date.now() - 3 * 24 * 60 * 60 * 1000
							).toISOString(),
							status: "Pending",
							currentApprover: "DepartmentHead",
							approvalChain: [
								"DepartmentHead",
								"Library",
								"Finance",
								"Registrar",
							],
							documents: ["Transcript.pdf", "ID Card.jpg", "Fee Receipt.pdf"],
							description:
								"Graduation clearance request for Computer Science department",
							priority: 2,
						},
						// ... other sample requests from the original file
					];
					setClearanceRequests(sampleRequests);
					localStorage.setItem(
						"clearanceRequests",
						JSON.stringify(sampleRequests)
					);
				}

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

	const handleClearanceRequestsUpdate = (updatedRequests) => {
		setClearanceRequests(updatedRequests);
		localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests));
	};

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

	return (
		<ApproverDashboard
			user={user}
			clearanceRequests={clearanceRequests}
			setClearanceRequests={handleClearanceRequestsUpdate}
		/>
	);
}
