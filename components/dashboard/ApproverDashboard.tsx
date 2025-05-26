"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	CheckCircle,
	XCircle,
	Clock,
	FileText,
	AlertCircle,
	ChevronDown,
	Download,
	Search,
	Bell,
	BarChart3,
	Settings,
	Home,
	CheckSquare,
	XSquare,
	Loader2,
	Eye,
	ArrowRight,
	MoreHorizontal,
	Sun,
	Moon,
	X,
	ArrowUpRight,
	ArrowDownRight,
	CalendarIcon,
	Clipboard,
	Filter,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentViewer } from "./DocumentViewer";
import { WorkflowProgress } from "./WorkflowProgress";
import { Chart, ChartContainer } from "@/components/ui/chart";
import {
	BarChart as RechartsBarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
	ResponsiveContainer,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	LineChart as RechartsLineChart,
	Line,
} from "recharts";
import axios from "axios";

interface ApproverDashboardProps {
	user: {
		id: string;
		username: string;
		role: string;
		department: string;
		name?: string;
		isFirstLogin?: boolean;
		email?: string;
		approver?: {
			office: {
				name: string;
			};
		};
	};
	clearanceRequests: any[];
	setClearanceRequests: (requests: any[]) => void;
}
const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

export default function ApproverDashboard({
	user,
	clearanceRequests,
	setClearanceRequests,
}: ApproverDashboardProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");

	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [reviewComment, setReviewComment] = useState("");
	const [requestedDocuments, setRequestedDocuments] = useState<string[]>([]);
	const [showDocumentViewer, setShowDocumentViewer] = useState(false);
	const [currentDocument, setCurrentDocument] = useState(null);
	const [notifications, setNotifications] = useState([
		{
			id: 1,
			title: "New Request",
			message: "A new clearance request has been submitted",
			time: "2 minutes ago",
			read: false,
			type: "info",
		},
		{
			id: 2,
			title: "Request Updated",
			message: "Student John Doe has updated their clearance request",
			time: "1 hour ago",
			read: false,
			type: "update",
		},
		{
			id: 3,
			title: "System Notification",
			message: "System maintenance scheduled for tonight at 2 AM",
			time: "3 hours ago",
			read: true,
			type: "system",
		},
	]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [activeTab, setActiveTab] = useState("dashboard");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [sortOrder, setSortOrder] = useState("newest");
	const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
	const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
	const [bulkAction, setBulkAction] = useState<"approve" | "reject" | null>(
		null
	);
	const [bulkComment, setBulkComment] = useState("");
	const [showProfileDialog, setShowProfileDialog] = useState(false);
	const [showNotificationPanel, setShowNotificationPanel] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(
		null
	);
	const [showInactivityDialog, setShowInactivityDialog] = useState(false);
	const [inactivityCountdown, setInactivityCountdown] = useState(60);
	const [showUndoApproval, setShowUndoApproval] = useState<string | null>(null);
	const [undoCountdown, setUndoCountdown] = useState(600); // 10 minutes in seconds
	const [undoInterval, setUndoInterval] = useState<NodeJS.Timeout | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(
		user.isFirstLogin || false
	);
	const [showEmailDialog, setShowEmailDialog] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [email, setEmail] = useState(user.email || "");
	const [passwordError, setPasswordError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [dateRange, setDateRange] = useState("week");
	const [reportType, setReportType] = useState("approvals");
	const [showReportDialog, setShowReportDialog] = useState(false);
	const [currentReport, setCurrentReport] = useState(null);
	const [showFilterDialog, setShowFilterDialog] = useState(false);
	const [filterDepartment, setFilterDepartment] = useState("all");
	const [filterDateFrom, setFilterDateFrom] = useState("");
	const [filterDateTo, setFilterDateTo] = useState("");
	const [filterRequestType, setFilterRequestType] = useState("all");
	const [showReviewPage, setShowReviewPage] = useState(false);

	// Analytics data
	const analyticsData = {
		weekly: (() => {
			const last7Days = Array(7).fill(0);
			const today = new Date();
			clearanceRequests.forEach((req) => {
				const submittedDate = new Date(req.submittedAt);
				const daysDiff = Math.floor(
					(today.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
				);
				if (daysDiff >= 0 && daysDiff < 7) {
					last7Days[6 - daysDiff]++;
				}
			});
			return last7Days;
		})(),
		monthly: (() => {
			const last30Days = Array(30).fill(0);
			const today = new Date();
			clearanceRequests.forEach((req) => {
				const submittedDate = new Date(req.submittedAt);
				const daysDiff = Math.floor(
					(today.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
				);
				if (daysDiff >= 0 && daysDiff < 30) {
					last30Days[29 - daysDiff]++;
				}
			});
			return last30Days;
		})(),
		approvalRates: {
			week: (() => {
				const weekRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						7
					);
				});
				const total = weekRequests.length;
				const approved = weekRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "APPROVED"
					)
				).length;
				const rejected = weekRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "REJECTED"
					)
				).length;
				return {
					approved: total ? Math.round((approved / total) * 100) : 0,
					rejected: total ? Math.round((rejected / total) * 100) : 0,
					total,
				};
			})(),
			month: (() => {
				const monthRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						30
					);
				});
				const total = monthRequests.length;
				const approved = monthRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "APPROVED"
					)
				).length;
				const rejected = monthRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "REJECTED"
					)
				).length;
				return {
					approved: total ? Math.round((approved / total) * 100) : 0,
					rejected: total ? Math.round((rejected / total) * 100) : 0,
					total,
				};
			})(),
			year: (() => {
				const yearRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						365
					);
				});
				const total = yearRequests.length;
				const approved = yearRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "APPROVED"
					)
				).length;
				const rejected = yearRequests.filter((req) =>
					req.approvalActions?.some(
						(action) =>
							action.approver?.office?.name === user.approver?.office?.name &&
							action.status === "REJECTED"
					)
				).length;
				return {
					approved: total ? Math.round((approved / total) * 100) : 0,
					rejected: total ? Math.round((rejected / total) * 100) : 0,
					total,
				};
			})(),
		},
		processingTimes: {
			week: (() => {
				const weekRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						7
					);
				});
				const completed = weekRequests.filter(
					(req) => req.status === "COMPLETED" || req.status === "REJECTED"
				);
				const totalTime = completed.reduce((sum, req) => {
					const start = new Date(req.submittedAt).getTime();
					const end = new Date(req.updatedAt || req.submittedAt).getTime();
					return sum + (end - start) / (1000 * 60 * 60 * 24);
				}, 0);
				return completed.length
					? Number((totalTime / completed.length).toFixed(1))
					: 0;
			})(),
			month: (() => {
				const monthRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						30
					);
				});
				const completed = monthRequests.filter(
					(req) => req.status === "COMPLETED" || req.status === "REJECTED"
				);
				const totalTime = completed.reduce((sum, req) => {
					const start = new Date(req.submittedAt).getTime();
					const end = new Date(req.updatedAt || req.submittedAt).getTime();
					return sum + (end - start) / (1000 * 60 * 60 * 24);
				}, 0);
				return completed.length
					? Number((totalTime / completed.length).toFixed(1))
					: 0;
			})(),
			year: (() => {
				const yearRequests = clearanceRequests.filter((req) => {
					const submittedDate = new Date(req.submittedAt);
					return (
						(new Date().getTime() - submittedDate.getTime()) /
							(1000 * 60 * 60 * 24) <=
						365
					);
				});
				const completed = yearRequests.filter(
					(req) => req.status === "COMPLETED" || req.status === "REJECTED"
				);
				const totalTime = completed.reduce((sum, req) => {
					const start = new Date(req.submittedAt).getTime();
					const end = new Date(req.updatedAt || req.submittedAt).getTime();
					return sum + (end - start) / (1000 * 60 * 60 * 24);
				}, 0);
				return completed.length
					? Number((totalTime / completed.length).toFixed(1))
					: 0;
			})(),
		},
	};

	// Reports data
	const reportsData = [
		{
			id: 1,
			title: "Monthly Approval Summary",
			type: "summary",
			date: "2023-11-01",
			data: {
				approved: 45,
				rejected: 8,
				pending: 12,
				avgProcessingTime: "1.5 days",
			},
		},
		{
			id: 2,
			title: "Department Performance",
			type: "performance",
			date: "2023-11-15",
			data: {
				departments: [
					{
						name: "Computer Science",
						approved: 18,
						rejected: 2,
						avgTime: "1.2 days",
					},
					{ name: "Finance", approved: 12, rejected: 3, avgTime: "1.8 days" },
					{ name: "Library", approved: 15, rejected: 3, avgTime: "1.5 days" },
				],
			},
		},
		{
			id: 3,
			title: "Yearly Trends",
			type: "trends",
			date: "2023-01-01",
			data: {
				months: [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				],
				approvals: [32, 38, 42, 35, 40, 45, 50, 48, 52, 58, 45, 60],
				rejections: [8, 5, 7, 6, 8, 10, 8, 7, 9, 12, 8, 10],
			},
		},
	];

	// Pie chart data for request types
	const requestTypeData = [
		{ name: "Graduation", value: 45 },
		{ name: "Transfer", value: 25 },
		{ name: "ID Card", value: 15 },
		{ name: "Leave", value: 10 },
		{ name: "Other", value: 5 },
	];

	// Colors for charts
	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

	useEffect(() => {
		// Set active tab from URL parameter if present
		if (tabParam) {
			setActiveTab(tabParam);
		}

		// Simulate loading data
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500);

		// Check for dark mode preference
		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Set up inactivity timer
		resetInactivityTimer();

		// Add keyboard shortcut listeners
		document.addEventListener("keydown", handleKeyboardShortcuts);

		// Check if first login and show password change dialog
		if (user.isFirstLogin) {
			setShowPasswordChangeDialog(true);
		}

		socket.on("notification:new", (notification) => {
			// Handle the new notification
			console.log("New notification:", notification);
			// Update state or show notification to the user
		});

		return () => {
			clearTimeout(timer);
			if (inactivityTimer) clearTimeout(inactivityTimer);
			if (undoInterval) clearInterval(undoInterval);
			document.removeEventListener("keydown", handleKeyboardShortcuts);
			socket.off("notification:new");
		};
	}, [tabParam, user.isFirstLogin]);

	const resetInactivityTimer = () => {
		if (inactivityTimer) clearTimeout(inactivityTimer);

		// Set 15 minute inactivity timer (900000 ms)
		const timer = setTimeout(() => {
			setShowInactivityDialog(true);

			// Start countdown
			const countdownInterval = setInterval(() => {
				setInactivityCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(countdownInterval);
						handleLogout();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			// Auto logout after 1 minute if no response
			setTimeout(() => {
				clearInterval(countdownInterval);
				if (showInactivityDialog) {
					handleLogout();
				}
			}, 60000);
		}, 900000); // 15 minutes

		setInactivityTimer(timer);
	};

	const handleKeyboardShortcuts = (e: KeyboardEvent) => {
		// Only process if a request is selected and Shift key is pressed
		if (!selectedRequest || !e.shiftKey) return;

		if (e.key === "a" || e.key === "A") {
			handleApprove();
		} else if (e.key === "r" || e.key === "R") {
			setShowReviewDialog(true);
		}
	};

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

	const handleLogout = () => {
		localStorage.removeItem("user");
		router.push("/login");
	};

	const handlePasswordChange = () => {
		// Validate passwords
		if (newPassword.length < 6) {
			setPasswordError("Password must be at least 6 characters long");
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		// Simulate password change
		setPasswordError("");

		// Update user in localStorage
		const updatedUser = {
			...user,
			password: newPassword,
			isFirstLogin: false,
		};

		localStorage.setItem("user", JSON.stringify(updatedUser));

		// Close dialog and show email dialog if email is empty
		setShowPasswordChangeDialog(false);

		if (!user.email) {
			setShowEmailDialog(true);
		}
	};

	const handleEmailUpdate = () => {
		// Validate email
		if (!email.includes("@")) {
			setEmailError("Please enter a valid email address");
			return;
		}

		// Simulate email update
		setEmailError("");

		// Update user in localStorage
		const updatedUser = {
			...user,
			email: email,
		};

		localStorage.setItem("user", JSON.stringify(updatedUser));

		// Close dialog
		setShowEmailDialog(false);
	};

	// Filter requests based on approver role and search/filter criteria
	function getPendingRequests() {
		let filtered = clearanceRequests.filter((request) => {
			// Check if this request is assigned to the current approver's office
			const isCurrentApprover =
				request.currentApprover === user.approver?.office?.name ||
				request.approvalActions?.some(
					(action) =>
						action.approver?.office?.name === user.approver?.office?.name &&
						action.status === "PENDING"
				);
			// Check if the request is pending
			const isPending = request.status === "PENDING";
			return isCurrentApprover && isPending;
		});

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(req) =>
					req.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					req.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					req.userInfo?.firstName
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					req.userInfo?.fatherName
						?.toLowerCase()
						.includes(searchQuery.toLowerCase())
			);
		}

		// Apply department filter (using userInfo.department)
		if (filterDepartment !== "all") {
			filtered = filtered.filter(
				(req) =>
					req.userInfo?.department?.toLowerCase().trim() ===
					filterDepartment.toLowerCase().trim()
			);
		}

		// Apply request type filter
		if (filterRequestType !== "all") {
			filtered = filtered.filter((req) => req.type === filterRequestType);
		}

		// Apply date filters
		if (filterDateFrom) {
			const fromDate = new Date(filterDateFrom);
			filtered = filtered.filter(
				(req) => new Date(req.submittedAt) >= fromDate
			);
		}

		if (filterDateTo) {
			const toDate = new Date(filterDateTo);
			toDate.setHours(23, 59, 59, 999); // End of the day
			filtered = filtered.filter((req) => new Date(req.submittedAt) <= toDate);
		}

		// Apply sorting
		if (sortOrder === "newest") {
			filtered.sort(
				(a, b) =>
					new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
			);
		} else if (sortOrder === "oldest") {
			filtered.sort(
				(a, b) =>
					new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
			);
		} else if (sortOrder === "priority") {
			filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
		}

		return filtered;
	}

	const getApprovedRequests = () => {
		return clearanceRequests.filter((request) =>
			request.approvalActions?.some(
				(action) =>
					(action.approver?.office?.name === user.approver?.office?.name ||
						action.approverId === user.id) &&
					action.status === "APPROVED"
			)
		);
	};
	const getRejectedRequests = () => {
		return clearanceRequests.filter((request) =>
			request.approvalActions?.some(
				(action) =>
					(action.approver?.office?.name === user.approver?.office?.name ||
						action.approverId === user.id) &&
					action.status === "REJECTED"
			)
		);
	};

	const handleReview = (request) => {
		setSelectedRequest(request);
		console.log("selectedRequest", selectedRequest);
		setShowReviewDialog(true);
		resetInactivityTimer();
	};

	const handleViewDetails = (request) => {
		setSelectedRequest(request);
		setShowReviewPage(true);
	};

	const handleApprove = async () => {
		if (!selectedRequest) return;
		setIsProcessing(true);
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const response = await axios.post(
				`${API_BASE_URL}/approver/request/${selectedRequest.id}/approve`,
				{ comment: reviewComment },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status === "success") {
				const updatedRequest = response.data.data;
				const updatedRequests = clearanceRequests.map((req) =>
					req.id === selectedRequest.id
						? {
								...req,
								approvalActions: [
									...(req.approvalActions || []),
									{
										approverId: user.id,
										status: "APPROVED",
										comment: reviewComment,
										actionDate: new Date().toISOString(),
										finalizedAt: new Date().toISOString(),
									},
								],
								currentApprover:
									updatedRequest.currentStep < req.approvalChain?.length
										? req.approvalChain[updatedRequest.currentStep]
										: null,
								status: updatedRequest.status,
								currentStep: updatedRequest.currentStep,
								updatedAt: new Date().toISOString(),
						  }
						: req
				);

				setClearanceRequests(updatedRequests);
				setShowReviewDialog(false);

				// Set undo timer
				setShowUndoApproval(selectedRequest.id);
				setUndoCountdown(600); // Reset to 10 minutes

				if (undoInterval) clearInterval(undoInterval);
				const interval = setInterval(() => {
					setUndoCountdown((prev) => {
						if (prev <= 1) {
							clearInterval(interval);
							setShowUndoApproval(null);
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
				setUndoInterval(interval);

				// Add notification
				setNotifications([
					{
						id: Date.now(),
						title: "Request Approved",
						message: `You have approved the ${selectedRequest.type} request.`,
						time: "Just now",
						read: false,
						type: "success",
					},
					...notifications,
				]);

				setSelectedRequest(null);
				setReviewComment("");
			}
		} catch (error) {
			console.error("Error approving request:", error);
			setNotifications([
				{
					id: Date.now(),
					title: "Approval Failed",
					message: "Failed to approve the request. Please try again.",
					time: "Just now",
					read: false,
					type: "error",
				},
				...notifications,
			]);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = async () => {
		if (!selectedRequest || !reviewComment) {
			alert("Please provide a reason for rejection");
			return;
		}

		setIsProcessing(true);
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const response = await axios.post(
				`${API_BASE_URL}/approver/request/${selectedRequest.id}/reject`,
				{ comment: reviewComment },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status === "success") {
				const updatedRequest = response.data.data;
				const updatedRequests = clearanceRequests.map((req) =>
					req.id === selectedRequest.id
						? {
								...req,
								approvalActions: [
									...(req.approvalActions || []),
									{
										approverId: user.id,
										status: "REJECTED",
										comment: reviewComment,
										actionDate: new Date().toISOString(),
										finalizedAt: new Date().toISOString(),
									},
								],
								status: "REJECTED",
								rejectionReason: reviewComment,
								updatedAt: new Date().toISOString(),
						  }
						: req
				);

				setClearanceRequests(updatedRequests);
				setShowReviewDialog(false);
				setSelectedRequest(null);
				setReviewComment("");

				// Add notification
				setNotifications([
					{
						id: Date.now(),
						title: "Request Rejected",
						message: `You have rejected the ${selectedRequest.type} request.`,
						time: "Just now",
						read: false,
						type: "error",
					},
					...notifications,
				]);
			}
		} catch (error) {
			console.error("Error rejecting request:", error);
			setNotifications([
				{
					id: Date.now(),
					title: "Rejection Failed",
					message: "Failed to reject the request. Please try again.",
					time: "Just now",
					read: false,
					type: "error",
				},
				...notifications,
			]);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRequestDocuments = async () => {
		if (requestedDocuments.length === 0) {
			alert("Please select at least one document to request");
			return;
		}

		setIsProcessing(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const updatedRequests = clearanceRequests.map((req) => {
				if (req.id === selectedRequest.id) {
					return {
						...req,
						status: "Documents Requested",
						requiredDocuments: requestedDocuments,
						updatedAt: new Date().toISOString(),
					};
				}
				return req;
			});

			setClearanceRequests(updatedRequests);
			setShowReviewDialog(false);
			setSelectedRequest(null);
			setReviewComment("");
			setRequestedDocuments([]);

			// Add notification
			setNotifications([
				{
					id: Date.now(),
					title: "Documents Requested",
					message: `You have requested additional documents for the ${selectedRequest.type} request.`,
					time: "Just now",
					read: false,
					type: "info",
				},
				...notifications,
			]);
		} catch (error) {
			console.error("Error requesting documents:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleUndoApproval = async () => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			const updatedRequests = clearanceRequests.map((req) => {
				if (req.id === showUndoApproval) {
					// Remove the last approval
					const approvals = [...(req.approvals || [])];
					approvals.pop();

					return {
						...req,
						approvals,
						currentApprover: user.role,
						status: "Pending",
						updatedAt: new Date().toISOString(),
					};
				}
				return req;
			});

			setClearanceRequests(updatedRequests);
			setShowUndoApproval(null);

			if (undoInterval) {
				clearInterval(undoInterval);
				setUndoInterval(null);
			}

			// Add notification
			setNotifications([
				{
					id: Date.now(),
					title: "Approval Undone",
					message: "You have undone your previous approval.",
					time: "Just now",
					read: false,
					type: "warning",
				},
				...notifications,
			]);
		} catch (error) {
			console.error("Error undoing approval:", error);
		}
	};

	const handleSelectRequest = (requestId: string) => {
		if (selectedRequests.includes(requestId)) {
			setSelectedRequests(selectedRequests.filter((id) => id !== requestId));
		} else {
			setSelectedRequests([...selectedRequests, requestId]);
		}
	};

	const handleBulkAction = async (action: "approve" | "reject") => {
		setBulkAction(action);
		setShowBulkActionDialog(true);
	};

	const executeBulkAction = async () => {
		if (bulkAction === "reject" && !bulkComment) {
			alert("Please provide a reason for rejection");
			return;
		}

		setIsProcessing(true);
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const updatedRequests = [...clearanceRequests];

			for (const requestId of selectedRequests) {
				const endpoint =
					bulkAction === "approve"
						? `${API_BASE_URL}/approver/request/${requestId}/approve`
						: `${API_BASE_URL}/approver/request/${requestId}/reject`;
				const response = await axios.post(
					endpoint,
					{ comment: bulkComment },
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data.status === "success") {
					const updatedRequest = response.data.data;
					const requestIndex = updatedRequests.findIndex(
						(req) => req.id === requestId
					);
					if (requestIndex !== -1) {
						updatedRequests[requestIndex] = {
							...updatedRequests[requestIndex],
							approvalActions: [
								...(updatedRequests[requestIndex].approvalActions || []),
								{
									approverId: user.id,
									status: bulkAction === "approve" ? "APPROVED" : "REJECTED",
									comment: bulkComment,
									actionDate: new Date().toISOString(),
									finalizedAt: new Date().toISOString(),
								},
							],
							status: updatedRequest.status,
							currentStep: updatedRequest.currentStep,
							currentApprover:
								updatedRequest.currentStep <
								updatedRequests[requestIndex].approvalChain?.length
									? updatedRequests[requestIndex].approvalChain[
											updatedRequest.currentStep
									  ]
									: null,
							rejectionReason:
								bulkAction === "reject"
									? bulkComment
									: updatedRequests[requestIndex].rejectionReason,
							updatedAt: new Date().toISOString(),
						};
					}
				}
			}

			setClearanceRequests(updatedRequests);
			setShowBulkActionDialog(false);
			setBulkComment("");
			setSelectedRequests([]);

			// Add notification
			setNotifications([
				{
					id: Date.now(),
					title: `Bulk ${bulkAction === "approve" ? "Approval" : "Rejection"}`,
					message: `You have ${
						bulkAction === "approve" ? "approved" : "rejected"
					} ${selectedRequests.length} requests.`,
					time: "Just now",
					read: false,
					type: bulkAction === "approve" ? "success" : "error",
				},
				...notifications,
			]);
		} catch (error) {
			console.error(`Error performing bulk ${bulkAction}:`, error);
			setNotifications([
				{
					id: Date.now(),
					title: `Bulk ${
						bulkAction === "approve" ? "Approval" : "Rejection"
					} Failed`,
					message: `Failed to ${bulkAction} the selected requests. Please try again.`,
					time: "Just now",
					read: false,
					type: "error",
				},
				...notifications,
			]);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleViewReport = (report) => {
		setCurrentReport(report);
		setShowReportDialog(true);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

	const markAllNotificationsAsRead = () => {
		const updatedNotifications = notifications.map((notification) => ({
			...notification,
			read: true,
		}));
		setNotifications(updatedNotifications);
	};

	const handleApplyFilters = () => {
		// Filters are already applied in the getPendingRequests function
		setShowFilterDialog(false);
	};

	const handleResetFilters = () => {
		setFilterDepartment("all");
		setFilterDateFrom("");
		setFilterDateTo("");
		setFilterRequestType("all");
		setShowFilterDialog(false);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh]">
				<Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					Loading dashboard...
				</h3>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Please wait while we fetch your data
				</p>
			</div>
		);
	}

	// Request Review Page
	if (showReviewPage && selectedRequest) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							Request Review
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Reviewing request {selectedRequest.id} from{" "}
							{selectedRequest.userId}
						</p>
					</div>
					<Button variant="outline" onClick={() => setShowReviewPage(false)}>
						<X className="h-4 w-4 mr-2" />
						Close Review
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Request Details */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Requester Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-4">
									<Avatar className="h-16 w-16">
										<AvatarImage
											src={`/placeholder.svg?height=64&width=64&text=${
												selectedRequest.userId?.charAt(0) || "U"
											}`}
										/>
										<AvatarFallback>
											{selectedRequest.userId?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="text-lg font-medium">
											{selectedRequest.userId}
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{selectedRequest.userInfo?.department || "Department"} •
											{"  "}
											{selectedRequest.userInfo?.program?.type ||
												"Program Type"}{" "}
											-{" "}
											{selectedRequest.userInfo?.program?.category ||
												"Program Category"}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Request ID
										</p>
										<p className="text-sm">{selectedRequest.id}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Submission Date
										</p>
										<p className="text-sm">
											{new Date(
												selectedRequest.submittedAt
											).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Request Type
										</p>
										<p className="text-sm">{selectedRequest.type}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Status
										</p>
										<Badge
											variant={
												selectedRequest.status === "Pending"
													? "outline"
													: selectedRequest.status === "Approved"
													? "success"
													: "destructive"
											}
										>
											{selectedRequest.status}
										</Badge>
									</div>
								</div>

								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Description
									</p>
									<p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
										{selectedRequest.description || "No description provided."}
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Uploaded Documents</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-3">
									{selectedRequest.documents?.map((doc, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
										>
											<div className="flex items-center">
												<FileText className="h-5 w-5 text-blue-500 mr-3" />
												<span className="text-sm">
													{typeof doc === "string" ? doc : doc.name}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setCurrentDocument(doc);
														setShowDocumentViewer(true);
													}}
												>
													<Eye className="h-4 w-4 mr-1" />
													View
												</Button>
												<Button variant="ghost" size="sm">
													<Download className="h-4 w-4 mr-1" />
													Download
												</Button>
											</div>
										</div>
									))}

									{(!selectedRequest.documents ||
										selectedRequest.documents.length === 0) && (
										<div className="text-center py-6">
											<FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
											<p className="text-sm text-gray-500">
												No documents uploaded
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Approval Workflow</CardTitle>
							</CardHeader>
							<CardContent>
								{selectedRequest.approvalChain && (
									<WorkflowProgress
										steps={selectedRequest.approvalChain}
										currentStep={selectedRequest.approvalChain.indexOf(
											selectedRequest.currentApprover
										)}
										rejectedStep={
											selectedRequest.status === "Rejected"
												? selectedRequest.approvalChain.indexOf(
														selectedRequest.currentApprover
												  )
												: undefined
										}
									/>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Actions and History */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Review Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Textarea
									placeholder="Add your comments here..."
									value={reviewComment}
									onChange={(e) => setReviewComment(e.target.value)}
									className="min-h-[120px]"
								/>

								<div className="space-y-2">
									<Label>Request Additional Documents</Label>
									<Select
										onValueChange={(value) =>
											setRequestedDocuments([...requestedDocuments, value])
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select required documents" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="payment_receipt">
												Payment Receipt
											</SelectItem>
											<SelectItem value="id_card">ID Card Copy</SelectItem>
											<SelectItem value="clearance_form">
												Clearance Form
											</SelectItem>
											<SelectItem value="no_dues_certificate">
												No Dues Certificate
											</SelectItem>
											<SelectItem value="library_card">Library Card</SelectItem>
										</SelectContent>
									</Select>

									{requestedDocuments.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{requestedDocuments.map((doc, index) => (
												<Badge
													key={index}
													variant="secondary"
													className="gap-2"
												>
													{doc}
													<button
														onClick={() =>
															setRequestedDocuments(
																requestedDocuments.filter((_, i) => i !== index)
															)
														}
														className="ml-1 hover:text-red-500"
													>
														×
													</button>
												</Badge>
											))}
										</div>
									)}
								</div>

								<div className="flex flex-col gap-3 mt-6">
									{requestedDocuments.length > 0 ? (
										<Button
											onClick={handleRequestDocuments}
											disabled={isProcessing}
											className="w-full gap-2"
										>
											{isProcessing ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Download className="h-4 w-4" />
											)}
											Request Documents
										</Button>
									) : (
										<>
											<Button
												variant="default"
												onClick={handleApprove}
												disabled={isProcessing}
												className="w-full gap-2"
											>
												{isProcessing ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<CheckCircle className="h-4 w-4" />
												)}
												Approve Request
											</Button>
											<Button
												variant="destructive"
												onClick={handleReject}
												disabled={isProcessing || !reviewComment}
												className="w-full gap-2"
											>
												{isProcessing ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<XCircle className="h-4 w-4" />
												)}
												Reject Request
											</Button>
										</>
									)}
								</div>

								{!reviewComment && selectedRequest.status === "Pending" && (
									<p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
										<AlertCircle className="h-3 w-3 inline mr-1" />A comment is
										required when rejecting a request
									</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Activity Log</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[300px] pr-4">
									<div className="space-y-4">
										{selectedRequest.approvals?.map((approval, index) => (
											<div
												key={index}
												className={`p-3 rounded-md ${
													approval.status === "Approved"
														? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20"
														: approval.status === "Rejected"
														? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
														: "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20"
												}`}
											>
												<div className="flex justify-between">
													<span className="text-sm font-medium">
														{approval.role}
													</span>
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{new Date(approval.timestamp).toLocaleString()}
													</span>
												</div>
												<div className="flex items-center mt-1">
													{approval.status === "Approved" ? (
														<CheckCircle className="h-4 w-4 text-green-500 mr-1" />
													) : approval.status === "Rejected" ? (
														<XCircle className="h-4 w-4 text-red-500 mr-1" />
													) : (
														<AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
													)}
													<span
														className={`text-sm ${
															approval.status === "Approved"
																? "text-green-600 dark:text-green-400"
																: approval.status === "Rejected"
																? "text-red-600 dark:text-red-400"
																: "text-blue-600 dark:text-blue-400"
														}`}
													>
														{approval.status}
													</span>
												</div>
												{approval.comment && (
													<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
														{approval.comment}
													</p>
												)}
											</div>
										))}

										<div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-md">
											<div className="flex justify-between">
												<span className="text-sm font-medium">System</span>
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{new Date(
														selectedRequest.submittedAt
													).toLocaleString()}
												</span>
											</div>
											<div className="flex items-center mt-1">
												<Clock className="h-4 w-4 text-blue-500 mr-1" />
												<span className="text-sm text-blue-600 dark:text-blue-400">
													Request Submitted
												</span>
											</div>
											<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
												Request was submitted by {selectedRequest.userId}
											</p>
										</div>
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Document Viewer Dialog */}
				{showDocumentViewer && (
					<DocumentViewer
						document={currentDocument}
						onClose={() => setShowDocumentViewer(false)}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						{user.department} Approver Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Welcome, {user.name || user.username}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Input
							placeholder="Search requests..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64 pl-9"
						/>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					</div>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="relative"
									onClick={() => setShowNotificationPanel(true)}
								>
									<Bell className="h-4 w-4" />
									{notifications.filter((n) => !n.read).length > 0 && (
										<span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
											{notifications.filter((n) => !n.read).length}
										</span>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>Notifications</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" onClick={toggleDarkMode}>
									{darkMode ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{darkMode ? "Light Mode" : "Dark Mode"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<div className="flex items-center gap-2 ml-2">
						<Avatar
							className="h-8 w-8 cursor-pointer"
							onClick={() => setShowProfileDialog(true)}
						>
							<AvatarImage
								src="/placeholder.svg?height=32&width=32&text=DH"
								alt={user.name || user.username}
							/>
							<AvatarFallback>
								{user.name?.charAt(0) || user.username.charAt(0)}
							</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</div>

			{/* Undo Approval Banner */}
			<AnimatePresence>
				{showUndoApproval && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<div>
								<p className="font-medium text-blue-800 dark:text-blue-300">
									Approval can be undone for {formatTime(undoCountdown)}
								</p>
								<p className="text-sm text-blue-600 dark:text-blue-400">
									You can undo your recent approval if you made a mistake.
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							onClick={handleUndoApproval}
							className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
						>
							Undo Approval
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<motion.div
					whileHover={{ y: -5 }}
					className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
					onClick={() => setActiveTab("pending")}
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
							<Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Pending Reviews
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{getPendingRequests().length}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					whileHover={{ y: -5 }}
					className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
					onClick={() => setActiveTab("approved")}
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
							<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Approved Requests
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{getApprovedRequests().length}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					whileHover={{ y: -5 }}
					className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
					onClick={() => setActiveTab("rejected")}
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
							<XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Rejected Requests
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{getRejectedRequests().length}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					whileHover={{ y: -5 }}
					className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
				>
					<div className="flex items-center gap-4">
						<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
							<BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Avg. Processing Time
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{analyticsData.processingTimes.week} days
							</p>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Main Content Tabs */}
			<Tabs
				defaultValue={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="mb-6 w-full justify-start border-b pb-px">
					<TabsTrigger value="dashboard" className="gap-2">
						<Home className="h-4 w-4" />
						Dashboard
					</TabsTrigger>
					<TabsTrigger value="pending" className="gap-2">
						<Clock className="h-4 w-4" />
						Pending Requests
					</TabsTrigger>
					<TabsTrigger value="approved" className="gap-2">
						<CheckCircle className="h-4 w-4" />
						Approved
					</TabsTrigger>
					<TabsTrigger value="rejected" className="gap-2">
						<XCircle className="h-4 w-4" />
						Rejected
					</TabsTrigger>
					<TabsTrigger value="reports" className="gap-2">
						<BarChart3 className="h-4 w-4" />
						Reports
					</TabsTrigger>
				</TabsList>

				{/* Dashboard Overview */}
				<TabsContent value="dashboard" className="space-y-6">
					{/* Analytics Chart */}
					<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>Approval Analytics</CardTitle>
									<CardDescription>
										Overview of approvals and rejections over time
									</CardDescription>
								</div>
								<Select value={dateRange} onValueChange={setDateRange}>
									<SelectTrigger className="w-36">
										<SelectValue placeholder="Select period" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="week">Last 7 days</SelectItem>
										<SelectItem value="month">Last 30 days</SelectItem>
										<SelectItem value="year">Last 12 months</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="col-span-2">
									<div className="h-80 w-full">
										<ChartContainer config={{}}>
											<Chart>
												<ResponsiveContainer width="100%" height="100%">
													<RechartsBarChart
														data={analyticsData[
															dateRange === "week"
																? "weekly"
																: dateRange === "month"
																? "monthly"
																: "yearly"
														].map((count, index) => ({
															name:
																dateRange === "week"
																	? [
																			"Sun",
																			"Mon",
																			"Tue",
																			"Wed",
																			"Thu",
																			"Fri",
																			"Sat",
																	  ][index % 7]
																	: `Day ${index + 1}`,
															approved: Math.round(count * 0.7),
															rejected: Math.round(count * 0.2),
															pending: Math.round(count * 0.1),
														}))}
														margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
													></RechartsBarChart>
												</ResponsiveContainer>
											</Chart>
										</ChartContainer>
									</div>
								</div>

								<div>
									<div className="space-y-6">
										<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
											<h3 className="text-sm font-medium mb-2">
												Approval Rate
											</h3>
											<div className="flex items-center gap-2 mb-2">
												<div className="text-2xl font-bold">
													{analyticsData.approvalRates[dateRange].approved}%
												</div>
												<Badge
													variant="outline"
													className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
												>
													<ArrowUpRight className="h-3 w-3 mr-1" />
													+2.5%
												</Badge>
											</div>
											<Progress
												value={analyticsData.approvalRates[dateRange].approved}
												className="h-2"
											/>
											<div className="flex justify-between text-xs text-gray-500 mt-1">
												<span>
													Approved:{" "}
													{analyticsData.approvalRates[dateRange].approved}%
												</span>
												<span>
													Rejected:{" "}
													{analyticsData.approvalRates[dateRange].rejected}%
												</span>
											</div>
										</div>

										<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
											<h3 className="text-sm font-medium mb-2">
												Processing Time
											</h3>
											<div className="flex items-center gap-2 mb-2">
												<div className="text-2xl font-bold">
													{analyticsData.processingTimes[dateRange]} days
												</div>
												<Badge
													variant="outline"
													className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
												>
													<ArrowDownRight className="h-3 w-3 mr-1" />
													-0.3 days
												</Badge>
											</div>
											<div className="text-xs text-gray-500">
												Average time to process a request
											</div>
										</div>

										<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
											<h3 className="text-sm font-medium mb-2">
												Total Processed
											</h3>
											<div className="text-2xl font-bold">
												{analyticsData.approvalRates[dateRange].total}
											</div>
											<div className="text-xs text-gray-500">
												Total requests processed in this period
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex justify-between">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{dateRange === "week"
									? "Last 7 days"
									: dateRange === "month"
									? "Last 30 days"
									: "Last 12 months"}{" "}
								activity
							</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setActiveTab("reports")}
							>
								View Detailed Reports
							</Button>
						</CardFooter>
					</Card>

					{/* Request Types Pie Chart */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Request Types</CardTitle>
								<CardDescription>Distribution of request types</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-64">
									<ChartContainer config={{}}>
										<Chart>
											<ResponsiveContainer width="100%" height="100%">
												<RechartsPieChart>
													<Pie
														data={requestTypeData}
														cx="50%"
														cy="50%"
														labelLine={false}
														label={({ name, percent }) =>
															`${name}: ${(percent * 100).toFixed(0)}%`
														}
														outerRadius={80}
														fill="#8884d8"
														dataKey="value"
													>
														{requestTypeData.map((entry, index) => (
															<Cell
																key={`cell-${index}`}
																fill={COLORS[index % COLORS.length]}
															/>
														))}
													</Pie>
													<RechartsTooltip />
												</RechartsPieChart>
											</ResponsiveContainer>
										</Chart>
									</ChartContainer>
								</div>
							</CardContent>
						</Card>

						{/* Priority Tasks */}
						<Card>
							<CardHeader>
								<CardTitle>Priority Tasks</CardTitle>
								<CardDescription>
									Requests that need your immediate attention
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{getPendingRequests()
										.slice(0, 3)
										.map((request) => (
											<Collapsible key={request.id}>
												<div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
													<div className="flex items-center gap-3">
														<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
															<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
														</div>
														<div>
															<p className="font-medium">{request.type}</p>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																From: {request.userInfo?.firstName}{" "}
																{request.userInfo?.fatherName} •{" "}
																{new Date(
																	request.submittedAt
																).toLocaleDateString()}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2">
														<Badge
															variant="outline"
															className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
														>
															Priority
														</Badge>
														<CollapsibleTrigger asChild>
															<Button variant="ghost" size="sm">
																<ChevronDown className="h-4 w-4" />
															</Button>
														</CollapsibleTrigger>
													</div>
												</div>
												<CollapsibleContent>
													<div className="p-4 mt-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
														<div className="space-y-3">
															<div>
																<h4 className="text-sm font-medium">
																	Description
																</h4>
																<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
																	{request.description ||
																		"No description provided."}
																</p>
															</div>
															<div className="flex justify-end gap-2">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleViewDetails(request)}
																	className="gap-1"
																>
																	<Eye className="h-3 w-3" />
																	View Details
																</Button>
																<Button
																	variant="default"
																	size="sm"
																	onClick={() => {
																		setSelectedRequest(request);
																		handleApprove();
																	}}
																	className="gap-1"
																>
																	<CheckCircle className="h-3 w-3" />
																	Quick Approve
																</Button>
															</div>
														</div>
													</div>
												</CollapsibleContent>
											</Collapsible>
										))}
								</div>

								{getPendingRequests().length > 3 && (
									<div className="mt-4 text-center">
										<Button
											variant="link"
											onClick={() => setActiveTab("pending")}
											className="gap-1"
										>
											View All Pending Requests
											<ArrowRight className="h-4 w-4" />
										</Button>
									</div>
								)}

								{getPendingRequests().length === 0 && (
									<div className="text-center py-8">
										<CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
										<h3 className="text-lg font-medium mb-2">All caught up!</h3>
										<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
											You have no pending requests that require your attention
											at this time.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Pending Requests Tab */}
				<TabsContent value="pending" className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<Select value={sortOrder} onValueChange={setSortOrder}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">Newest First</SelectItem>
									<SelectItem value="oldest">Oldest First</SelectItem>
									<SelectItem value="priority">Priority</SelectItem>
								</SelectContent>
							</Select>

							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowFilterDialog(true)}
								className="gap-1"
							>
								<Filter className="h-4 w-4" />
								Filters
							</Button>
						</div>

						{selectedRequests.length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									{selectedRequests.length} selected
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleBulkAction("approve")}
									className="gap-1"
								>
									<CheckSquare className="h-4 w-4" />
									Approve Selected
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleBulkAction("reject")}
									className="gap-1"
								>
									<XSquare className="h-4 w-4" />
									Reject Selected
								</Button>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-3">
							<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
								<CardHeader>
									<CardTitle>Pending Requests</CardTitle>
									<CardDescription>
										{getPendingRequests().length} requests awaiting your review
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full border-collapse">
											<thead>
												<tr className="border-b border-gray-200 dark:border-gray-700">
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														<Checkbox
															checked={
																selectedRequests.length > 0 &&
																selectedRequests.length ===
																	getPendingRequests().length
															}
															onCheckedChange={(checked) => {
																if (checked) {
																	setSelectedRequests(
																		getPendingRequests().map((req) => req.id)
																	);
																} else {
																	setSelectedRequests([]);
																}
															}}
															aria-label="Select all"
														/>
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Request ID
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Requester
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Type
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Submitted
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Priority
													</th>
													<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{getPendingRequests().map((request, index) => (
													<tr
														key={request.id}
														className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
															index % 2 === 0
																? "bg-gray-50 dark:bg-gray-800/30"
																: ""
														}`}
													>
														<td className="px-4 py-4">
															<Checkbox
																checked={selectedRequests.includes(request.id)}
																onCheckedChange={() =>
																	handleSelectRequest(request.id)
																}
																aria-label={`Select request ${request.id}`}
															/>
														</td>
														<td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
															{request.id}
														</td>
														<td className="px-4 py-4">
															<div className="flex items-center">
																<Avatar className="h-8 w-8 mr-2">
																	<AvatarImage
																		src={`/placeholder.svg?height=32&width=32&text=${
																			request.userId?.charAt(0) || "U"
																		}`}
																	/>
																	<AvatarFallback>
																		{request.userId?.charAt(0) || "U"}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<div className="text-sm font-medium text-gray-900 dark:text-white">
																		{request.userId}
																	</div>
																	<div className="text-xs text-gray-500 dark:text-gray-400">
																		{request?.userInfo?.department ||
																			"Department"}
																	</div>
																</div>
															</div>
														</td>
														<td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
															{request.type}
														</td>
														<td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
															{new Date(
																request.submittedAt
															).toLocaleDateString()}
														</td>
														<td className="px-4 py-4">
															<Badge
																variant={
																	request.priority === 1
																		? "destructive"
																		: request.priority === 2
																		? "default"
																		: "secondary"
																}
															>
																{request.priority === 1
																	? "High"
																	: request.priority === 2
																	? "Medium"
																	: "Low"}
															</Badge>
														</td>
														<td className="px-4 py-4">
															<div className="flex gap-2">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleViewDetails(request)}
																	className="gap-1"
																>
																	<Eye className="h-4 w-4" />
																	View
																</Button>
																<Button
																	variant="default"
																	size="sm"
																	onClick={() => {
																		setSelectedRequest(request);
																		handleApprove();
																	}}
																	className="gap-1"
																>
																	<CheckCircle className="h-4 w-4" />
																	Approve
																</Button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{getPendingRequests().length === 0 && (
										<div className="text-center py-8">
											<CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
											<h3 className="text-lg font-medium mb-2">
												All caught up!
											</h3>
											<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
												You have no pending requests that require your attention
												at this time.
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
				{/* Approved Requests Tab */}
				<TabsContent value="approved" className="space-y-4">
					<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
						<CardHeader>
							<CardTitle>Approved Requests</CardTitle>
							<CardDescription>
								History of requests you have approved
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{getApprovedRequests().map((request) => (
									<motion.div
										key={request.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
									>
										<Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
															{request.type}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Approved on{" "}
															{new Date(
																request?.approvalActions?.find(
																	(action) =>
																		action.status === "APPROVED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.actionDate
															).toLocaleDateString()}
														</p>
													</div>
													<Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
														Approved
													</Badge>
												</div>

												<Collapsible className="mt-4">
													<CollapsibleTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="gap-1 w-full justify-center"
														>
															<ChevronDown className="h-4 w-4" />
															<span>View Details</span>
														</Button>
													</CollapsibleTrigger>
													<CollapsibleContent className="mt-2 space-y-3">
														<div>
															<h4 className="text-sm font-medium">
																Submitted By
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																{request.userId}
															</p>
														</div>

														<div>
															<h4 className="text-sm font-medium">
																Your Comment
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																{request.approvalActions?.find(
																	(action) =>
																		action.status === "APPROVED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.comment || "No comment provided."}
															</p>
														</div>

														{request.documents?.length > 0 && (
															<div>
																<h4 className="text-sm font-medium">
																	Documents
																</h4>
																<div className="mt-1 flex flex-wrap gap-2">
																	{request.documents.map((doc, index) => (
																		<Badge
																			key={index}
																			variant="secondary"
																			className="cursor-pointer"
																			onClick={() => {
																				setCurrentDocument(doc);
																				setShowDocumentViewer(true);
																			}}
																		>
																			<FileText className="h-3 w-3 mr-1" />
																			{typeof doc === "string" ? doc : doc.name}
																		</Badge>
																	))}
																</div>
															</div>
														)}

														{request.approvalChain && (
															<div>
																<h4 className="text-sm font-medium mb-2">
																	Approval Workflow
																</h4>
																<WorkflowProgress
																	steps={request.approvalChain}
																	currentStep={
																		request.approvalChain.indexOf(
																			request.currentApprover
																		) >= 0
																			? request.approvalChain.indexOf(
																					request.currentApprover
																			  )
																			: request.approvalChain.length - 1
																	}
																/>
															</div>
														)}
													</CollapsibleContent>
												</Collapsible>
											</CardContent>
										</Card>
									</motion.div>
								))}

								{getApprovedRequests().length === 0 && (
									<div className="text-center py-8">
										<CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
										<h3 className="text-lg font-medium mb-2">
											No approved requests
										</h3>
										<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
											You haven't approved any requests yet. They will appear
											here once you do.
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Rejected Requests Tab */}
				<TabsContent value="rejected" className="space-y-4">
					<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
						<CardHeader>
							<CardTitle>Rejected Requests</CardTitle>
							<CardDescription>
								History of requests you have rejected
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{getRejectedRequests().map((request) => (
									<motion.div
										key={request.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
									>
										<Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
															{request.type}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Rejected on{" "}
															{new Date(
																request?.approvalActions?.find(
																	(action) =>
																		action.status === "REJECTED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.actionDate
															).toLocaleDateString()}
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Rejected on{" "}
															{new Date(
																request?.approvalActions?.find(
																	(action) =>
																		action.status === "REJECTED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.actionDate
															).toLocaleDateString()}
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Rejected on{" "}
															{new Date(
																request?.approvalActions?.find(
																	(action) =>
																		action.status === "REJECTED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.actionDate
															).toLocaleDateString()}
														</p>
													</div>
													<Badge variant="destructive">Rejected</Badge>
												</div>

												<Collapsible className="mt-4">
													<CollapsibleTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="gap-1 w-full justify-center"
														>
															<ChevronDown className="h-4 w-4" />
															<span>View Details</span>
														</Button>
													</CollapsibleTrigger>
													<CollapsibleContent className="mt-2 space-y-3">
														<div>
															<h4 className="text-sm font-medium">
																Submitted By
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																{request.userId}
															</p>
														</div>

														<div>
															<h4 className="text-sm font-medium">
																Rejection Reason
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																{request.approvalActions?.find(
																	(action) =>
																		action.status === "REJECTED" &&
																		action.approver?.office?.name ===
																			user.approver?.office?.name
																)?.comment || "No reason provided."}
															</p>
														</div>

														{request.documents?.length > 0 && (
															<div>
																<h4 className="text-sm font-medium">
																	Documents
																</h4>
																<div className="mt-1 flex flex-wrap gap-2">
																	{request.documents.map((doc, index) => (
																		<Badge
																			key={index}
																			variant="secondary"
																			className="cursor-pointer"
																			onClick={() => {
																				setCurrentDocument(doc);
																				setShowDocumentViewer(true);
																			}}
																		>
																			<FileText className="h-3 w-3 mr-1" />
																			{typeof doc === "string" ? doc : doc.name}
																		</Badge>
																	))}
																</div>
															</div>
														)}

														{request.approvalChain && (
															<div>
																<h4 className="text-sm font-medium mb-2">
																	Approval Workflow
																</h4>
																<WorkflowProgress
																	steps={request.approvalChain}
																	currentStep={request.approvalChain.indexOf(
																		request.currentApprover
																	)}
																	rejectedStep={
																		request.approvalChain.indexOf(user.role) >=
																		0
																			? request.approvalChain.indexOf(user.role)
																			: request.approvalChain.indexOf(
																					user.department
																			  )
																	}
																/>
															</div>
														)}
													</CollapsibleContent>
												</Collapsible>
											</CardContent>
										</Card>
									</motion.div>
								))}

								{getRejectedRequests().length === 0 && (
									<div className="text-center py-8">
										<XCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
										<h3 className="text-lg font-medium mb-2">
											No rejected requests
										</h3>
										<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
											You haven't rejected any requests yet. They will appear
											here once you do.
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				{/* Reports Tab */}
				<TabsContent value="reports" className="space-y-6">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="text-xl font-semibold">Reports & Analytics</h2>
							<p className="text-gray-600 dark:text-gray-400">
								View and generate reports on clearance request data
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Select value={reportType} onValueChange={setReportType}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Report type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="approvals">Approvals</SelectItem>
									<SelectItem value="rejections">Rejections</SelectItem>
									<SelectItem value="processing">Processing Time</SelectItem>
								</SelectContent>
							</Select>

							<Select value={dateRange} onValueChange={setDateRange}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Date range" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="week">Last 7 days</SelectItem>
									<SelectItem value="month">Last 30 days</SelectItem>
									<SelectItem value="year">Last 12 months</SelectItem>
								</SelectContent>
							</Select>

							<Button variant="outline" className="gap-2">
								<CalendarIcon className="h-4 w-4" />
								Custom Range
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 col-span-2">
							<CardHeader>
								<CardTitle>Approval Trends</CardTitle>
								<CardDescription>
									{dateRange === "week"
										? "Last 7 days"
										: dateRange === "month"
										? "Last 30 days"
										: "Last 12 months"}{" "}
									approval and rejection trends
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-80 w-full">
									<ChartContainer config={{}}>
										<Chart>
											<ResponsiveContainer width="100%" height="100%">
												<RechartsBarChart
													data={[
														{ name: "Mon", approved: 5, rejected: 1 },
														{ name: "Tue", approved: 7, rejected: 2 },
														{ name: "Wed", approved: 4, rejected: 1 },
														{ name: "Thu", approved: 6, rejected: 0 },
														{ name: "Fri", approved: 8, rejected: 1 },
														{ name: "Sat", approved: 3, rejected: 0 },
														{ name: "Sun", approved: 2, rejected: 0 },
													]}
													margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
												>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<RechartsTooltip />
													<Legend />
													<Bar
														dataKey="approved"
														name="Approved"
														fill="#4ade80"
													/>
													<Bar
														dataKey="rejected"
														name="Rejected"
														fill="#f87171"
													/>
												</RechartsBarChart>
											</ResponsiveContainer>
										</Chart>
									</ChartContainer>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Approvals
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-red-500 rounded-full"></div>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Rejections
										</span>
									</div>
								</div>
								<Button variant="outline" size="sm">
									Download CSV
								</Button>
							</CardFooter>
						</Card>

						<div className="space-y-6">
							<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
								<CardHeader>
									<CardTitle>Summary</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Total Requests
											</span>
											<span className="font-medium">
												{analyticsData.approvalRates[dateRange].total}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Approved
											</span>
											<span className="font-medium text-green-600 dark:text-green-400">
												{Math.round(
													(analyticsData.approvalRates[dateRange].total *
														analyticsData.approvalRates[dateRange].approved) /
														100
												)}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Rejected
											</span>
											<span className="font-medium text-red-600 dark:text-red-400">
												{Math.round(
													(analyticsData.approvalRates[dateRange].total *
														analyticsData.approvalRates[dateRange].rejected) /
														100
												)}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Avg. Processing Time
											</span>
											<span className="font-medium">
												{analyticsData.processingTimes[dateRange]} days
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
								<CardHeader>
									<CardTitle>Saved Reports</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{reportsData.map((report) => (
											<div
												key={report.id}
												className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
												onClick={() => handleViewReport(report)}
											>
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-medium">{report.title}</h4>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															Generated on{" "}
															{new Date(report.date).toLocaleDateString()}
														</p>
													</div>
													<Badge variant="outline">{report.type}</Badge>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* Review Dialog */}
			<Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Review Request</DialogTitle>
						<DialogDescription>
							Review the request details and make your decision.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{selectedRequest && (
							<>
								<div className="grid gap-4">
									<div>
										<Label>Request Type</Label>
										<p className="text-sm font-medium">
											{selectedRequest.type}
										</p>
									</div>

									<div>
										<Label>
											Comment{" "}
											{bulkAction === "reject" && (
												<span className="text-red-500">*</span>
											)}
										</Label>
										<Textarea
											value={reviewComment}
											onChange={(e) => setReviewComment(e.target.value)}
											placeholder="Add your review comments..."
											className="mt-1"
										/>
										{bulkAction === "reject" && !reviewComment && (
											<p className="text-xs text-red-500 mt-1">
												A comment is required for rejections
											</p>
										)}
									</div>

									<div>
										<Label>Request Additional Documents</Label>
										<Select
											onValueChange={(value) =>
												setRequestedDocuments([...requestedDocuments, value])
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select required documents" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="payment_receipt">
													Payment Receipt
												</SelectItem>
												<SelectItem value="id_card">ID Card Copy</SelectItem>
												<SelectItem value="clearance_form">
													Clearance Form
												</SelectItem>
												<SelectItem value="no_dues_certificate">
													No Dues Certificate
												</SelectItem>
												<SelectItem value="library_card">
													Library Card
												</SelectItem>
											</SelectContent>
										</Select>

										{requestedDocuments.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{requestedDocuments.map((doc, index) => (
													<Badge
														key={index}
														variant="secondary"
														className="gap-2"
													>
														{doc}
														<button
															onClick={() =>
																setRequestedDocuments(
																	requestedDocuments.filter(
																		(_, i) => i !== index
																	)
																)
															}
															className="ml-1 hover:text-red-500"
														>
															×
														</button>
													</Badge>
												))}
											</div>
										)}
									</div>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => setShowReviewDialog(false)}
										disabled={isProcessing}
									>
										Cancel
									</Button>
									{requestedDocuments.length > 0 ? (
										<Button
											onClick={handleRequestDocuments}
											disabled={isProcessing}
											className="gap-2"
										>
											<Download className="h-4 w-4" />
											Request Documents
										</Button>
									) : (
										<>
											<Button
												variant="destructive"
												onClick={handleReject}
												disabled={isProcessing || !reviewComment}
												className="gap-2"
											>
												<XCircle className="h-4 w-4" />
												Reject
											</Button>
											<Button
												variant="default"
												onClick={handleApprove}
												disabled={isProcessing}
												className="gap-2"
											>
												<CheckCircle className="h-4 w-4" />
												Approve
											</Button>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Document Viewer Dialog */}
			{showDocumentViewer && (
				<DocumentViewer
					document={currentDocument}
					onClose={() => setShowDocumentViewer(false)}
				/>
			)}

			{/* Bulk Action Dialog */}
			<Dialog
				open={showBulkActionDialog}
				onOpenChange={setShowBulkActionDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{bulkAction === "approve"
								? "Bulk Approve Requests"
								: "Bulk Reject Requests"}
						</DialogTitle>
						<DialogDescription>
							You are about to {bulkAction === "approve" ? "approve" : "reject"}{" "}
							{selectedRequests.length} requests.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>
								Comment{" "}
								{bulkAction === "reject" && (
									<span className="text-red-500">*</span>
								)}
							</Label>
							<Textarea
								value={bulkComment}
								onChange={(e) => setBulkComment(e.target.value)}
								placeholder={`Add a comment for all ${
									bulkAction === "approve" ? "approvals" : "rejections"
								}...`}
								className="mt-1"
							/>
							{bulkAction === "reject" && !bulkComment && (
								<p className="text-xs text-red-500 mt-1">
									A comment is required for rejections
								</p>
							)}
						</div>

						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setShowBulkActionDialog(false)}
								disabled={isProcessing}
							>
								Cancel
							</Button>
							<Button
								variant={bulkAction === "approve" ? "default" : "destructive"}
								onClick={executeBulkAction}
								disabled={
									isProcessing || (bulkAction === "reject" && !bulkComment)
								}
								className="gap-2"
							>
								{isProcessing ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : bulkAction === "approve" ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									<XCircle className="h-4 w-4" />
								)}
								{bulkAction === "approve" ? "Approve" : "Reject"}{" "}
								{selectedRequests.length} Requests
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Filter Dialog */}
			<Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Filter Requests</DialogTitle>
						<DialogDescription>
							Apply filters to narrow down the request list
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Department</Label>
							<Select
								value={filterDepartment}
								onValueChange={setFilterDepartment}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Departments</SelectItem>
									<SelectItem value="Computer Science">
										Computer Science
									</SelectItem>
									<SelectItem value="Business">Business</SelectItem>
									<SelectItem value="Engineering">Engineering</SelectItem>
									<SelectItem value="Arts">Arts</SelectItem>
									<SelectItem value="Medicine">Medicine</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Request Type</Label>
							<Select
								value={filterRequestType}
								onValueChange={setFilterRequestType}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select request type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="Graduation Clearance">
										Graduation Clearance
									</SelectItem>
									<SelectItem value="Transfer Clearance">
										Transfer Clearance
									</SelectItem>
									<SelectItem value="Library Clearance">
										Library Clearance
									</SelectItem>
									<SelectItem value="Leave Clearance">
										Leave Clearance
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Date From</Label>
								<Input
									type="date"
									value={filterDateFrom}
									onChange={(e) => setFilterDateFrom(e.target.value)}
								/>
							</div>
							<div>
								<Label>Date To</Label>
								<Input
									type="date"
									value={filterDateTo}
									onChange={(e) => setFilterDateTo(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={handleResetFilters}>
								Reset Filters
							</Button>
							<Button onClick={handleApplyFilters}>Apply Filters</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Profile Dialog */}
			<Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>User Profile</DialogTitle>
						<DialogDescription>
							Manage your profile and preferences
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="flex flex-col items-center">
							<Avatar className="h-20 w-20 mb-4">
								<AvatarImage
									src="/placeholder.svg?height=80&width=80&text=DH"
									alt={user.name || user.username}
								/>
								<AvatarFallback>
									{user.name?.charAt(0) || user.username.charAt(0)}
								</AvatarFallback>
							</Avatar>

							<h3 className="text-lg font-medium">
								{user.name || user.username}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{user.role} • {user.department}
							</p>
						</div>

						<div className="space-y-3">
							<div>
								<Label>Display Name</Label>
								<Input
									defaultValue={user.name || user.username}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Email</Label>
								<Input defaultValue={user.email || ""} className="mt-1" />
							</div>

							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<Label>Dark Mode</Label>
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Toggle between light and dark themes
									</span>
								</div>
								<Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
							</div>

							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<Label>Notification Sounds</Label>
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Play sounds for new notifications
									</span>
								</div>
								<Switch defaultChecked />
							</div>

							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<Label>Two-Factor Authentication</Label>
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Enhance your account security
									</span>
								</div>
								<Button variant="outline" size="sm">
									Enable
								</Button>
							</div>

							<div className="pt-2">
								<Button
									variant="outline"
									className="w-full"
									onClick={() => setShowPasswordChangeDialog(true)}
								>
									Change Password
								</Button>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowProfileDialog(false)}
						>
							Cancel
						</Button>
						<Button>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Notification Panel */}
			<Dialog
				open={showNotificationPanel}
				onOpenChange={setShowNotificationPanel}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Notifications</DialogTitle>
						<DialogDescription>
							You have {notifications.filter((n) => !n.read).length} unread
							notifications
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="h-[60vh]">
						<div className="space-y-3 pr-3">
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-3 rounded-lg ${
										notification.read
											? "bg-gray-50 dark:bg-gray-800"
											: "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400"
									}`}
								>
									<div className="flex items-start gap-3">
										<div
											className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
												notification.type === "success"
													? "bg-green-100 dark:bg-green-900/20"
													: notification.type === "error"
													? "bg-red-100 dark:bg-red-900/20"
													: notification.type === "warning"
													? "bg-yellow-100 dark:bg-yellow-900/20"
													: "bg-blue-100 dark:bg-blue-900/20"
											}`}
										>
											{notification.type === "success" && (
												<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
											)}
											{notification.type === "error" && (
												<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
											)}
											{notification.type === "warning" && (
												<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
											)}
											{(notification.type === "info" ||
												notification.type === "update") && (
												<Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
											)}
											{notification.type === "system" && (
												<Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
											)}
										</div>

										<div className="flex-1">
											<div className="flex justify-between">
												<h4 className="font-medium">{notification.title}</h4>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 -mt-1 -mr-1"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{notification.message}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
												{notification.time}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>

					<DialogFooter>
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
							onClick={markAllNotificationsAsRead}
						>
							<CheckCircle className="h-4 w-4" />
							Mark All as Read
						</Button>
						<Button size="sm">View All</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Inactivity Dialog */}
			<Dialog
				open={showInactivityDialog}
				onOpenChange={setShowInactivityDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Session Timeout</DialogTitle>
						<DialogDescription>
							You've been inactive for a while. Would you like to stay logged
							in?
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 text-center">
						<p className="text-lg font-medium">
							Logging out in{" "}
							<span className="text-red-600 dark:text-red-400">
								{inactivityCountdown}
							</span>{" "}
							seconds
						</p>
						<Progress
							value={(inactivityCountdown / 60) * 100}
							className="mt-4"
						/>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={handleLogout}>
							Logout Now
						</Button>
						<Button
							onClick={() => {
								setShowInactivityDialog(false);
								resetInactivityTimer();
							}}
						>
							Stay Logged In
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Password Change Dialog */}
			<Dialog
				open={showPasswordChangeDialog}
				onOpenChange={(open) => {
					// Only allow closing if not first login
					if (!user.isFirstLogin) {
						setShowPasswordChangeDialog(open);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{user.isFirstLogin
								? "Change Default Password"
								: "Change Password"}
						</DialogTitle>
						<DialogDescription>
							{user.isFirstLogin
								? "You need to change your default password before continuing."
								: "Update your password to keep your account secure."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{user.isFirstLogin && (
							<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
									<p className="text-sm text-yellow-800 dark:text-yellow-300">
										For security reasons, you must change your default password
										on first login.
									</p>
								</div>
							</div>
						)}

						<div className="space-y-3">
							<div>
								<Label>New Password</Label>
								<Input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Confirm Password</Label>
								<Input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="mt-1"
								/>
							</div>

							{passwordError && (
								<p className="text-sm text-red-500">{passwordError}</p>
							)}
						</div>
					</div>

					<DialogFooter>
						{!user.isFirstLogin && (
							<Button
								variant="outline"
								onClick={() => setShowPasswordChangeDialog(false)}
							>
								Cancel
							</Button>
						)}
						<Button onClick={handlePasswordChange}>Change Password</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Email Dialog */}
			<Dialog
				open={showEmailDialog}
				onOpenChange={(open) => {
					// Allow skipping email setup
					setShowEmailDialog(open);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Your Email</DialogTitle>
						<DialogDescription>
							Add your email address for notifications and account recovery.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Email Address</Label>
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-1"
							/>

							{emailError && (
								<p className="text-sm text-red-500 mt-1">{emailError}</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowEmailDialog(false)}>
							Skip for Now
						</Button>
						<Button onClick={handleEmailUpdate}>Save Email</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Report Dialog */}
			<Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>{currentReport?.title}</DialogTitle>
						<DialogDescription>
							Generated on{" "}
							{currentReport
								? new Date(currentReport.date).toLocaleDateString()
								: ""}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{currentReport?.type === "summary" && (
							<div className="grid grid-cols-2 gap-4">
								<Card>
									<CardHeader>
										<CardTitle>Approval Statistics</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span>Approved:</span>
												<span className="font-medium">
													{currentReport.data.approved}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Rejected:</span>
												<span className="font-medium">
													{currentReport.data.rejected}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Pending:</span>
												<span className="font-medium">
													{currentReport.data.pending}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Total:</span>
												<span className="font-medium">
													{currentReport.data.approved +
														currentReport.data.rejected +
														currentReport.data.pending}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Processing Time</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-col items-center justify-center h-32">
											<div className="text-3xl font-bold">
												{currentReport.data.avgProcessingTime}
											</div>
											<div className="text-sm text-gray-500">
												Average processing time
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{currentReport?.type === "performance" && (
							<Card>
								<CardHeader>
									<CardTitle>Department Performance</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{currentReport.data.departments.map((dept, index) => (
											<div key={index} className="border-b pb-3 last:border-0">
												<div className="flex justify-between items-center mb-2">
													<h4 className="font-medium">{dept.name}</h4>
													<Badge
														variant={
															dept.approved > dept.rejected * 3
																? "success"
																: "default"
														}
													>
														{dept.approved > dept.rejected * 3
															? "Excellent"
															: "Good"}
													</Badge>
												</div>
												<div className="grid grid-cols-3 gap-2 text-sm">
													<div>
														<span className="text-gray-500">Approved:</span>{" "}
														{dept.approved}
													</div>
													<div>
														<span className="text-gray-500">Rejected:</span>{" "}
														{dept.rejected}
													</div>
													<div>
														<span className="text-gray-500">Avg Time:</span>{" "}
														{dept.avgTime}
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{currentReport?.type === "trends" && (
							<Card>
								<CardHeader>
									<CardTitle>Yearly Trends</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="h-80 w-full">
										<ChartContainer config={{}}>
											<Chart>
												<ResponsiveContainer width="100%" height="100%">
													<RechartsLineChart
														data={currentReport.data.months.map(
															(month, index) => ({
																name: month,
																approvals: currentReport.data.approvals[index],
																rejections:
																	currentReport.data.rejections[index],
															})
														)}
														margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
													>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="name" />
														<YAxis />
														<RechartsTooltip />
														<Legend />
														<Line
															type="monotone"
															dataKey="approvals"
															name="Approvals"
															stroke="#4ade80"
														/>
														<Line
															type="monotone"
															dataKey="rejections"
															name="Rejections"
															stroke="#f87171"
														/>
													</RechartsLineChart>
												</ResponsiveContainer>
											</Chart>
										</ChartContainer>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" className="gap-2">
							<Download className="h-4 w-4" />
							Download PDF
						</Button>
						<Button variant="outline" className="gap-2">
							<Clipboard className="h-4 w-4" />
							Export CSV
						</Button>
						<Button onClick={() => setShowReportDialog(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
