"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApproverDashboard from "@/components/dashboard/ApproverDashboard";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function ApproverPage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [clearanceRequests, setClearanceRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const checkAuth = async () => {
			try {
				const token = localStorage.getItem("authToken");
				if (!token) {
					router.push("/login");
					return;
				}

				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
				const response = await axios.get(`${API_BASE_URL}/users/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.data.status === "success") {
					const userData = response.data.data;

					// Check if user is an approver
					if (!userData.approver && userData.role !== "APPROVER") {
						router.push("/login");
						return;
					}

					setUser(userData);
					localStorage.setItem("user", JSON.stringify(userData));

					// Fetch all clearance requests (pending, approved, rejected)
					try {
						const [pendingResponse, approvedResponse, rejectedResponse] =
							await Promise.all([
								axios.get(`${API_BASE_URL}/approver/pending`, {
									headers: { Authorization: `Bearer ${token}` },
								}),
								axios.get(`${API_BASE_URL}/approver/approved`, {
									headers: { Authorization: `Bearer ${token}` },
								}),
								axios.get(`${API_BASE_URL}/approver/rejected`, {
									headers: { Authorization: `Bearer ${token}` },
								}),
							]);

						const formatRequest = (req) => ({
							id: req.id,
							type: req.formType.replace(/_/g, " "),
							userId: req.user.id,
							submittedAt: req.submittedAt,
							status: req.status,
							currentApprover:
								req.approvalActions.find(
									(action) => action.status === "PENDING"
								)?.approver.office.name || null,
							approvalChain: req.approvalActions.map(
								(action) => action.approver.office.name
							),
							approvalActions: req.approvalActions,
							documents: req.documents?.map((doc) => doc.filePath) || [],
							description: `${
								req.terminationReason?.reason ||
								req.idReplacementReason?.reason ||
								req.teacherClearanceReason?.reason ||
								"No reason specified"
							}`,
							priority: req.currentStep,
							userInfo: {
								firstName: req.user.firstName,
								fatherName: req.user.fatherName,
								grandfatherName: req.user.grandfatherName,
								department: req.user.student?.department?.name || "Unknown",
								program: req.user.student?.program
									? {
											type: req.user.student.program.type || "N/A",
											category: req.user.student.program.category || "N/A",
									  }
									: null,
							},
						});

						const allRequests = [
							...(pendingResponse.data.status === "success"
								? pendingResponse.data.data.map(formatRequest)
								: []),
							...(approvedResponse.data.status === "success"
								? approvedResponse.data.data.map(formatRequest)
								: []),
							...(rejectedResponse.data.status === "success"
								? rejectedResponse.data.data.map(formatRequest)
								: []),
						];

						setClearanceRequests(allRequests);
						localStorage.setItem(
							"clearanceRequests",
							JSON.stringify(allRequests)
						);
					} catch (reqErr) {
						console.error("Error loading clearance requests:", reqErr);
						setError("Failed to load clearance requests. Please try again.");
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

		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			try {
				const userData = JSON.parse(storedUser);

				if (userData.role !== "APPROVER") {
					router.replace("/dashboard/requester");
					return;
				}

				setUser(userData);
				checkAuth();
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
					{error.includes("authenticate") ? (
						<p className="text-gray-500 dark:text-gray-400 text-center mt-2">
							Redirecting to login...
						</p>
					) : (
						<button
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							onClick={() => window.location.reload()}
						>
							Retry
						</button>
					)}
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
			setClearanceRequests={(updatedRequests) => {
				setClearanceRequests(updatedRequests);
				localStorage.setItem(
					"clearanceRequests",
					JSON.stringify(updatedRequests)
				);
			}}
		/>
	);
}
