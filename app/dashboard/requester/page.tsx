"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Check,
	Clock,
	FileText,
	ChevronRight,
	Upload,
	Bell,
	MessageSquare,
	AlertCircle,
	X,
	Calendar,
	Users,
	CheckCircle,
	FileCheck,
	Library,
	Building,
	CreditCard,
	HelpCircle,
	Search,
	Loader2,
	UserCircle,
	LogOut,
	Menu,
	Sun,
	Home,
	Settings,
	Moon,
	Plus,
	Book,
	User,
	HomeIcon,
	DollarSign,
	Shield,
	Coffee,
	BookOpen,
	Scale,
	Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { ClearanceRequestForm } from "@/components/dashboard/ClearanceRequestForm";
import { ClearanceStatusCard } from "@/components/dashboard/ClearanceStatusCard";
import axios from "axios";
import { io } from "socket.io-client";

const NavItem = ({ icon: Icon, label, href, active = false }) => (
	<Link href={href} className="block w-full">
		<motion.div whileHover={{ x: 5 }}>
			<div
				className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors ${
					active
						? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
						: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
				}`}
			>
				<Icon className="h-5 w-5" />
				<span>{label}</span>
				{active && (
					<div className="ml-auto w-1.5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full" />
				)}
			</div>
		</motion.div>
	</Link>
);

export const officeIconMap = {
	"Academic Advisor": User,
	"Department Head": Building,
	"Dormitory Head": HomeIcon,
	"Library (A) Chief of Circulation": Library,
	"Library (B) Chief of Circulation (Main)": Library,
	"Library (C)": Library,
	"Library (B)": Library,
	"Main Library": Library,
	"Post Graduate Dean": FileCheck,
	Registrar: FileCheck,
	"Students' Cafeteria Head": Coffee,
	"Finance Office": DollarSign,
	"Campus Police": Shield,
	"Book Store": Book,
	"Continuing Education": BookOpen,
	"College Community Service and Postgraduate Program Coordinator": Users,
	"Director of Research and Technology Transfer Directorate": Briefcase,
	"Director of Industry Liaison and Technology Transfer": Briefcase,
	"Director of Community Service": Users,
	"Senior Staff for Research and Community Service": User,
	"Library Equipment Store": Library,
	"Property Group": Building,
	"Chief Cashier": DollarSign,
	"Assistant Cashier": DollarSign,
	"College Dean": FileCheck,
	"College Accounting Staff": DollarSign,
	"College Cashier": DollarSign,
	"Collecting Accounting Staff": DollarSign,
	IBE: Building,
	"Revenue Collection Specialist": DollarSign,
	"General Service Directorate": Building,
	"Immediate Supervisor": User,
	Auditor: FileCheck,
	"Legal Service": Scale,
	"Teachers and Staff Cooperative Association": Users,
	"Ethics and Anti-Corruption Directorate": Scale,
};

export default function RequesterDashboard() {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [darkMode, setDarkMode] = useState(false);
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showNewRequestForm, setShowNewRequestForm] = useState(false);
	const [userClearanceRequests, setUserClearanceRequests] = useState([]);
	const [userData, setUserData] = useState(null);
	const [clearanceStages, setClearanceStages] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [pendingDocuments, setPendingDocuments] = useState([]);
	const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
	const [overallProgress, setOverallProgress] = useState(0);
	const [documentTypes, setDocumentTypes] = useState([]);
	const [selectedDocumentType, setSelectedDocumentType] = useState("");
	const [selectedRequestId, setSelectedRequestId] = useState("");
	const [documentDescription, setDocumentDescription] = useState("");
	const [socket, setSocket] = useState(null);
	const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		const fetchNotifications = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
				const notificationsResponse = await axios.get(
					`${API_BASE_URL}/clearance/notifications`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (notificationsResponse.data.status === "success") {
					const fetchedNotifications = notificationsResponse.data.data || [];
					const uniqueNotifications = fetchedNotifications.filter(
						(n, index, self) => index === self.findIndex((t) => t.id === n.id)
					);
					setNotifications(
						uniqueNotifications.map((n) => ({
							...n,
							clearanceRequestId: n.clearanceRequestId || null,
							read: n.read ?? false,
						}))
					);
					setUnreadCount(uniqueNotifications.filter((n) => !n.read).length);
				}
			} catch (error) {
				console.error("Error fetching notifications:", error);
			}
		};

		const checkAuth = async () => {
			fetchNotifications();
			try {
				const token = localStorage.getItem("authToken");
				if (!token) {
					router.push("/login");
					return;
				}

				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const userResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (userResponse.data.status === "success") {
					const userData = userResponse.data.data;
					if (userData.role !== "STUDENT" && userData.role !== "TEACHER") {
						if (userData.role === "ADMIN") {
							router.push("/dashboard/admin");
						} else if (userData.role === "APPROVER") {
							router.push("/dashboard/approver");
						} else {
							router.push("/login");
						}
						return;
					}

					setUser(userData);
					localStorage.setItem("user", JSON.stringify(userData));

					try {
						const requestsResponse = await axios.get(
							`${API_BASE_URL}/clearance/requests`,
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						);
						if (requestsResponse.data.status === "success") {
							const requests = requestsResponse.data.data || [];
							setUserClearanceRequests(requests);

							if (requests.length > 0) {
								const latestRequest = requests[0];
								await fetchRequestDetails(latestRequest.id);
							}
						}
					} catch (requestsError) {
						console.error("Failed to fetch clearance requests:", requestsError);
					}

					try {
						const notificationsResponse = await axios.get(
							`${API_BASE_URL}/clearance/notifications`,
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						);
						if (notificationsResponse.data.status === "success") {
							const fetchedNotifications =
								notificationsResponse.data.data || [];
							setNotifications(
								fetchedNotifications.map((n) => ({
									...n,
									clearanceRequestId: n.clearanceRequestId || null,
									read: n.read ?? false,
								}))
							);
							setUnreadCount(
								fetchedNotifications.filter((n) => !n.read).length
							);
						}
					} catch (notificationsError) {
						console.error("Failed to fetch notifications:", notificationsError);
					}

					try {
						const deadlinesResponse = await axios.get(
							`${API_BASE_URL}/clearance/deadlines`,
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						);
						if (deadlinesResponse.data.status === "success") {
							setUpcomingDeadlines(deadlinesResponse.data.data || []);
						}
					} catch (deadlinesError) {
						console.error("Failed to fetch deadlines:", deadlinesError);
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
			setUser(JSON.parse(storedUser));
			setLoading(false);
			checkAuth();
		} else {
			checkAuth();
		}

		const newSocket = io(
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
			{
				auth: { token: localStorage.getItem("authToken") },
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			}
		);
		setSocket(newSocket);

		newSocket.on("connect", () => {
			console.log("Connected to WebSocket server");
			newSocket.emit("join", JSON.parse(storedUser || "{}").id);
		});

		newSocket.on("notification:new", (notification) => {
			setNotifications((prev) => {
				const exists = prev.some((n) => n.id === notification.id);
				if (exists) return prev;
				const updatedNotifications = [
					{
						...notification,
						read: notification.read ?? false,
						clearanceRequestId: notification.clearanceRequestId || null,
					},
					...prev,
				];
				setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
				return updatedNotifications;
			});
		});

		newSocket.on("request:assigned", (request) => {
			setUserClearanceRequests((prev) => {
				if (prev.some((r) => r.id === request.id)) return prev;
				return [request, ...prev];
			});
		});

		newSocket.on("request:status-updated", async (data) => {
			setUserClearanceRequests((prev) =>
				prev.map((req) =>
					req.id === data.id
						? { ...req, status: data.status, currentStep: data.currentStep }
						: req
				)
			);
			if (userClearanceRequests[currentRequestIndex]?.id === data.id) {
				await fetchRequestDetails(data.id);
			}
		});

		const checkMobile = () => {
			const isMobile = window.innerWidth < 1024;
			setSidebarOpen(!isMobile);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => {
			window.removeEventListener("resize", checkMobile);
			newSocket.disconnect();
		};
	}, [router]);

	const fetchRequestDetails = async (requestId) => {
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			const workflowResponse = await axios.get(
				`${API_BASE_URL}/clearance/workflow/${requestId}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (workflowResponse.data.status === "success") {
				const workflow = workflowResponse.data.data;
				setClearanceStages(workflow.steps);
				setOverallProgress(workflow.progress);
			}

			const documentsResponse = await axios.get(
				`${API_BASE_URL}/clearance/documents/${requestId}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (documentsResponse.data.status === "success") {
				setPendingDocuments(documentsResponse.data.data || []);
			}
		} catch (error) {
			console.error("Error fetching request details:", error);
		}
	};

	useEffect(() => {
		const fetchDocumentTypes = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const response = await axios.get(
					`${API_BASE_URL}/clearance/document-types`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (response.data.status === "success") {
					setDocumentTypes(response.data.data || []);
				}
			} catch (error) {
				console.error("Error fetching document types:", error);
			}
		};

		if (user) {
			fetchDocumentTypes();
		}
	}, [user]);

	useEffect(() => {
		if (
			userClearanceRequests.length > 0 &&
			currentRequestIndex >= 0 &&
			currentRequestIndex < userClearanceRequests.length
		) {
			fetchRequestDetails(userClearanceRequests[currentRequestIndex].id);
		}
	}, [currentRequestIndex, userClearanceRequests]);

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

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleUploadSubmit = async () => {
		if (!selectedFile) return;

		setUploading(true);
		setUploadProgress(0);

		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("documentTypeId", selectedDocumentType);
			formData.append("requestId", selectedRequestId);

			const interval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(interval);
						return 90;
					}
					return prev + 5;
				});
			}, 200);

			const response = await axios.post(
				`${API_BASE_URL}/clearance/upload-document`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
					onUploadProgress: (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						setUploadProgress(percentCompleted);
					},
				}
			);

			if (response.data.status === "success") {
				setUploadProgress(100);

				if (userClearanceRequests.length > 0) {
					const latestRequest = userClearanceRequests[0];
					await fetchRequestDetails(latestRequest.id);
				}

				setTimeout(() => {
					setUploadModalOpen(false);
					setSelectedFile(null);
					setUploadProgress(0);
					setSelectedDocumentType("");
					setSelectedRequestId("");
				}, 1000);
			}
		} catch (error) {
			console.error("Error uploading document:", error);
			setUploadProgress(0);
		} finally {
			setUploading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("authToken");
		router.push("/login");
	};

	const handleNewRequest = () => {
		setShowNewRequestForm(true);
	};

	const markNotificationAsRead = async (notificationId) => {
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			await axios.post(
				`${API_BASE_URL}/clearance/notifications/read`,
				{ notificationId },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
			);
			setUnreadCount((prev) => prev - 1);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAllNotificationsAsRead = async () => {
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			await axios.post(
				`${API_BASE_URL}/clearance/notifications/read-all`,
				{},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
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
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
				darkMode ? "dark" : ""
			} overflow-x-hidden`}
		>
			{/* Mobile Header */}
			<header className="lg:hidden fixed top-0 inset-x-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
				<div className="flex items-center">
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
						aria-label="Toggle sidebar"
					>
						<Menu className="h-6 w-6" />
					</button>
					<span className="font-bold text-xl flex items-center">
						<Image
							src="/placeholder.svg?height=32&width=32&text=DCS"
							alt="Logo"
							width={32}
							height={32}
							className="mr-2"
						/>
						DCS
					</span>
				</div>
				<div className="flex items-center gap-3">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => setNotificationPanelOpen(true)}
									className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
									aria-label="Notifications"
								>
									<Bell className="h-6 w-6" />
									{unreadCount > 0 && (
										<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
											{unreadCount}
										</span>
									)}
								</button>
							</TooltipTrigger>
							<TooltipContent>Notifications</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<Avatar className="h-8 w-8">
						<AvatarImage
							src="/placeholder.svg?height=100&width=100&text=User"
							alt={user?.name}
						/>
						<AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
					</Avatar>
				</div>
			</header>

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transform transition-transform lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<Link
						href="/dashboard/requester"
						className="font-bold text-xl flex items-center"
					>
						<Image
							src="/placeholder.svg?height=32&width=32&text=DCS"
							alt="Logo"
							width={32}
							height={32}
							className="mr-2"
						/>
						DCS
					</Link>
					<button
						className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
						onClick={() => setSidebarOpen(false)}
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage
								src="/placeholder.svg?height=100&width=100&text=User"
								alt={user?.firstName}
							/>
							<AvatarFallback>
								{user?.firstName.charAt(0) || "User"}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="font-medium truncate text-gray-900 dark:text-gray-100">
								{user?.firstName || "User"}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{user?.username || "1"} • {user.role || ""}
							</p>
						</div>
					</div>
				</div>

				<nav className="p-3 space-y-1 overflow-y-auto flex-grow">
					<NavItem
						icon={Home}
						label="Dashboard"
						href="/dashboard/requester"
						active={pathname === "/dashboard/requester"}
					/>
					<NavItem
						icon={FileText}
						label="My Requests"
						href="/dashboard/requests"
						active={pathname === "/dashboard/requests"}
					/>
					<NavItem
						icon={Clock}
						label="Pending Tasks"
						href="/dashboard/tasks"
						active={pathname === "/dashboard/tasks"}
					/>
					<NavItem
						icon={MessageSquare}
						label="Messages"
						href="/dashboard/messages"
						active={pathname === "/dashboard/messages"}
					/>
					<NavItem
						icon={UserCircle}
						label="Profile"
						href="/dashboard/profile"
						active={pathname === "/dashboard/profile"}
					/>
					<NavItem
						icon={Settings}
						label="Settings"
						href="/dashboard/settings"
						active={pathname === "/dashboard/settings"}
					/>
					<NavItem
						icon={HelpCircle}
						label="Help Center"
						href="/dashboard/help"
						active={pathname === "/dashboard/help"}
					/>
				</nav>

				<div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
					<button
						onClick={toggleDarkMode}
						className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						{darkMode ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
						<span>Dark Mode</span>
					</button>

					<button
						onClick={handleLogout}
						className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
					>
						<LogOut className="h-5 w-5" />
						<span>Logout</span>
					</button>
				</div>
			</aside>

			{sidebarOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<main
				className={`transition-all duration-300 ${
					sidebarOpen ? "lg:ml-7" : "lg:ml-0"
				} pt-16 lg:pt-0`}
			>
				<div className="max-w-7xl mx-auto px-2 py-4">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">
							Welcome back, {user?.firstName.split(" ")[0] || "User"}
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Here's an overview of your clearance status
						</p>

						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
							<div className="relative w-full sm:w-64">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 w-full bg-white dark:bg-gray-800"
								/>
							</div>

							<div className="flex items-center gap-3">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												className="relative"
												onClick={() => setNotificationPanelOpen(true)}
											>
												<Bell className="h-4 w-4" />
												{unreadCount > 0 && (
													<span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
														{unreadCount}
													</span>
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>Notifications</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<Button
									className="gap-2 bg-blue-600 hover:bg-blue-700"
									onClick={() => setUploadModalOpen(true)}
								>
									<Upload className="h-4 w-4" />
									<span>Upload Document</span>
								</Button>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold">Clearance Progress</h2>
								{userClearanceRequests.length > 0 && (
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setCurrentRequestIndex((prev) => Math.max(prev - 1, 0))
											}
											disabled={currentRequestIndex === 0}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setCurrentRequestIndex((prev) =>
													Math.min(prev + 1, userClearanceRequests.length - 1)
												)
											}
											disabled={
												currentRequestIndex === userClearanceRequests.length - 1
											}
										>
											Next
										</Button>
										<Badge className="bg-blue-500 text-white px-3 py-1 rounded-full">
											{overallProgress}% Complete
										</Badge>
									</div>
								)}
							</div>
							{userClearanceRequests.length > 0 && (
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Request Type:{" "}
									{userClearanceRequests[currentRequestIndex].formType.replace(
										/_/g,
										" "
									)}
								</p>
							)}
							<div className="space-y-4">
								{userClearanceRequests.length > 0 ? (
									<>
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span className="text-gray-600 dark:text-gray-400">
													Overall Progress
												</span>
												<span className="font-medium">{overallProgress}%</span>
											</div>
											<Progress value={overallProgress} className="h-2" />
										</div>

										<div className="space-y-4 mt-4">
											{clearanceStages.map((stage, index) => {
												const OfficeIcon =
													officeIconMap[stage.officeName] || FileText;
												const isFirstPending =
													index === 0 && stage.status === "PENDING";
												const statusLabel = isFirstPending
													? "Pending"
													: stage.status === "APPROVED"
													? "Completed"
													: stage.status === "REJECTED"
													? "Rejected"
													: "Waiting";
												const statusIcon =
													stage.status === "APPROVED" ? (
														<Check className="h-5 w-5" />
													) : stage.status === "REJECTED" ? (
														<X className="h-5 w-5" />
													) : stage.status === "PENDING" ? (
														<Clock className="h-5 w-5" />
													) : (
														<Clock className="h-5 w-5" />
													);

												return (
													<div
														key={stage.stepOrder}
														className="flex items-center gap-3"
													>
														<div
															className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
																stage.status === "APPROVED"
																	? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
																	: stage.status === "REJECTED"
																	? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
																	: stage.status === "PENDING"
																	? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
																	: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
															}`}
														>
															{statusIcon}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex justify-between">
																<p className="font-medium">
																	{stage.officeName}
																</p>
																<Badge
																	variant={
																		stage.status === "APPROVED"
																			? "success"
																			: stage.status === "REJECTED"
																			? "destructive"
																			: stage.status === "PENDING"
																			? "outline"
																			: "secondary"
																	}
																	className={
																		stage.status === "APPROVED"
																			? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
																			: stage.status === "REJECTED"
																			? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
																			: stage.status === "PENDING"
																			? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
																			: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
																	}
																>
																	{statusLabel}
																</Badge>
															</div>
															<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
																{stage.approverName
																	? `Approver: ${stage.approverName}`
																	: stage.description ||
																	  `${stage.officeName} clearance`}
															</p>
														</div>
													</div>
												);
											})}
										</div>

										<Link
											href={`/dashboard/check-status?requestId=${userClearanceRequests[currentRequestIndex].id}`}
											className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-2"
										>
											<span>View Detailed Progress</span>
											<ChevronRight className="h-4 w-4 ml-1" />
										</Link>
									</>
								) : (
									<div className="text-center py-8">
										<FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
										<h3 className="text-lg font-medium mb-2">
											No active clearance requests
										</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
											You haven't submitted any clearance requests yet. Start a
											new request to begin the clearance process.
										</p>
										<Button onClick={handleNewRequest}>
											Start New Request
										</Button>
									</div>
								)}
							</div>
						</Card>

						<Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
							<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								<div
									className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
									onClick={handleNewRequest}
								>
									<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
										<Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
									</div>
									<span className="text-sm font-medium">New Request</span>
								</div>

								<Link href="/dashboard/upload-docs">
									<div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
										<div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
											<Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
										</div>
										<span className="text-sm font-medium">Upload Docs</span>
									</div>
								</Link>

								<Link href="/dashboard/check-status">
									<div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
										<div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
											<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
										</div>
										<span className="text-sm font-medium">Check Status</span>
									</div>
								</Link>

								<Link href="/dashboard/support">
									<div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
										<div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
											<MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
										</div>
										<span className="text-sm font-medium">Get Support</span>
									</div>
								</Link>
							</div>
						</Card>
					</div>

					<Card className="mt-6 p-6 bg-white dark:bg-gray-800 shadow-sm">
						<Tabs defaultValue="notifications">
							<div className="flex items-center justify-between mb-4">
								<TabsList>
									<TabsTrigger value="documents">Pending Documents</TabsTrigger>
									<TabsTrigger value="notifications">
										Recent Notifications
										{unreadCount > 0 && (
											<Badge className="ml-2 bg-red-500 text-white">
												{unreadCount}
											</Badge>
										)}
									</TabsTrigger>
									<TabsTrigger value="schedule">Upcoming Deadlines</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="documents" className="space-y-4">
								{pendingDocuments.length > 0 ? (
									pendingDocuments.map((doc) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
														doc.status === "submitted"
															? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
															: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
													}`}
												>
													<FileText className="h-5 w-5" />
												</div>
												<div>
													<p className="font-medium">{doc.name}</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{doc.description} •{" "}
														{doc.status.charAt(0).toUpperCase() +
															doc.status.slice(1)}
													</p>
												</div>
											</div>

											{doc.status === "pending" ? (
												<Button
													size="sm"
													className="gap-1"
													onClick={() => {
														setSelectedRequestId(doc.requestId || "");
														setUploadModalOpen(true);
													}}
												>
													<Upload className="h-3 w-3" />
													Upload
												</Button>
											) : (
												<Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
													Submitted
												</Badge>
											)}
										</div>
									))
								) : (
									<div className="text-center py-6">
										<p className="text-gray-500 dark:text-gray-400">
											No pending documents found. Start a new clearance request
											to see required documents.
										</p>
									</div>
								)}
							</TabsContent>

							<TabsContent value="notifications" className="space-y-4">
								{notifications.length > 0 ? (
									notifications.slice(0, 5).map((notification) => (
										<div
											key={notification.id}
											className={`p-4 rounded-lg cursor-pointer ${
												notification.read
													? "bg-gray-50 dark:bg-gray-800"
													: "bg-blue-50 dark:bg-blue-900/10"
											} border border-gray-200 dark:border-gray-700`}
											onClick={() => {
												if (!notification.read) {
													markNotificationAsRead(notification.id);
												}
												if (notification.clearanceRequestId) {
													router.push(
														`/dashboard/check-status?requestId=${notification.clearanceRequestId}`
													);
												}
											}}
										>
											<div className="flex gap-3">
												<div
													className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
														notification.type === "INFO"
															? "bg-blue-100 dark:bg-blue-900/20"
															: notification.type === "ACTION_REQUIRED"
															? "bg-yellow-100 dark:bg-yellow-900/20"
															: "bg-green-100 dark:bg-green-900/20"
													}`}
												>
													{notification.type === "INFO" && (
														<Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
													)}
													{notification.type === "ACTION_REQUIRED" && (
														<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
													)}
													{notification.type === "SYSTEM" && (
														<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
													)}
												</div>
												<div className="flex-1">
													<div className="flex justify-between">
														<h4 className="font-medium">
															{notification.title}
														</h4>
														{!notification.read && (
															<Badge className="bg-blue-500 text-white">
																New
															</Badge>
														)}
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{notification.message}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
														{new Date(notification.sentAt).toLocaleString()}
													</p>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="text-center py-6">
										<p className="text-gray-500 dark:text-gray-400">
											No notifications yet. We'll notify you about important
											updates here.
										</p>
									</div>
								)}
							</TabsContent>

							<TabsContent value="schedule" className="space-y-4">
								{upcomingDeadlines.length > 0 ? (
									upcomingDeadlines.map((deadline) => {
										const daysLeft = Math.ceil(
											(new Date(deadline.dueDate).getTime() - Date.now()) /
												(1000 * 60 * 60 * 24)
										);
										return (
											<div
												key={deadline.id}
												className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
											>
												<div className="flex items-center gap-3">
													<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
														<Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
													</div>
													<div>
														<h4 className="font-medium">{deadline.title}</h4>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{new Date(deadline.dueDate).toLocaleDateString()}{" "}
															({daysLeft} days left)
														</p>
													</div>
												</div>
											</div>
										);
									})
								) : (
									<div className="text-center py-6">
										<p className="text-gray-500 dark:text-gray-400">
											No upcoming deadlines.
										</p>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</Card>

					<Card className="mt-6 p-6 bg-white dark:bg-gray-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">My Clearance Requests</h2>
							{userClearanceRequests.length > 0 && (
								<Link href="/dashboard/requests">
									<Button variant="outline" size="sm" className="gap-1">
										<span>View All</span>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</Link>
							)}
						</div>

						<div className="space-y-4">
							{userClearanceRequests.length > 0 ? (
								userClearanceRequests
									.slice(0, 3)
									.map((request) => (
										<ClearanceStatusCard key={request.id} request={request} />
									))
							) : (
								<div className="text-center py-8">
									<FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
									<h3 className="text-lg font-medium mb-2">
										No clearance requests yet
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
										You haven't submitted any clearance requests. Click the
										button below to start a new request.
									</p>
									<Button onClick={handleNewRequest}>Start New Request</Button>
								</div>
							)}
						</div>
					</Card>
				</div>

				<Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Upload Document</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Document Type</label>
								<select
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
									value={selectedDocumentType}
									onChange={(e) => setSelectedDocumentType(e.target.value)}
								>
									<option value="">Select document type</option>
									{documentTypes.map((docType) => (
										<option key={docType.id} value={docType.id}>
											{docType.name}
										</option>
									))}
								</select>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Select Request</label>
								<select
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
									value={selectedRequestId}
									onChange={(e) => setSelectedRequestId(e.target.value)}
								>
									<option value="">Select request</option>
									{userClearanceRequests.map((req) => (
										<option key={req.id} value={req.id}>
											{req.formType.replace(/_/g, " ")} -{" "}
											{new Date(req.submittedAt).toLocaleDateString()}
										</option>
									))}
								</select>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Description</label>
								<textarea
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 min-h-[80px]"
									placeholder="Add a brief description of this document..."
									value={documentDescription}
									onChange={(e) => setDocumentDescription(e.target.value)}
								/>
							</div>

							<div
								className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
								onClick={() => document.getElementById("file-upload").click()}
							>
								<input
									type="file"
									id="file-upload"
									className="hidden"
									onChange={handleFileUpload}
								/>
								<Upload className="h-8 w-8 mx-auto text-gray-400" />
								<p className="mt-2 text-sm font-medium">
									{selectedFile
										? selectedFile.name
										: "Drag & drop or click to upload"}
								</p>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{selectedFile
										? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
										: "PDF, PNG, JPG or DOCX up to 10MB"}
								</p>
							</div>

							{uploading && (
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Uploading...</span>
										<span>{uploadProgress}%</span>
									</div>
									<Progress value={uploadProgress} className="h-2" />
								</div>
							)}

							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
									onClick={() => setUploadModalOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleUploadSubmit}
									disabled={
										!selectedFile ||
										!selectedDocumentType ||
										!selectedRequestId ||
										uploading
									}
								>
									{uploading ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Upload className="h-4 w-4 mr-2" />
									)}
									Upload
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				<Dialog
					open={notificationPanelOpen}
					onOpenChange={setNotificationPanelOpen}
				>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Notifications</DialogTitle>
						</DialogHeader>
						<div className="max-h-[60vh] overflow-y-auto space-y-4">
							{notifications.length > 0 ? (
								notifications.map((notification) => (
									<div
										key={notification.id}
										className={`p-4 rounded-lg cursor-pointer ${
											notification.read
												? "bg-gray-50 dark:bg-gray-800"
												: "bg-blue-50 dark:bg-blue-900/10"
										} border border-gray-200 dark:border-gray-700`}
										onClick={() => {
											if (!notification.read) {
												markNotificationAsRead(notification.id);
											}
											if (notification.clearanceRequestId) {
												router.push(
													`/dashboard/check-status?requestId=${notification.clearanceRequestId}`
												);
												setNotificationPanelOpen(false);
											}
										}}
									>
										<div className="flex gap-3">
											<div
												className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
													notification.type === "INFO"
														? "bg-blue-100 dark:bg-blue-900/20"
														: notification.type === "ACTION_REQUIRED"
														? "bg-yellow-100 dark:bg-yellow-900/20"
														: "bg-green-100 dark:bg-green-900/20"
												}`}
											>
												{notification.type === "INFO" && (
													<Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												)}
												{notification.type === "ACTION_REQUIRED" && (
													<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
												)}
												{notification.type === "SYSTEM" && (
													<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
												)}
											</div>
											<div className="flex-1">
												<div className="flex justify-between">
													<h4 className="font-medium">{notification.title}</h4>
													{!notification.read && (
														<Badge className="bg-blue-500 text-white">
															New
														</Badge>
													)}
												</div>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{notification.message}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
													{new Date(notification.sentAt).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-6">
									<p className="text-gray-500 dark:text-gray-400">
										No notifications available.
									</p>
								</div>
							)}
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={showNewRequestForm} onOpenChange={setShowNewRequestForm}>
					<DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden">
						<DialogHeader className="px-4 py-2 sm:px-6 sm:py-4 border-b sticky top-0 z-10 bg-white dark:bg-gray-900 flex flex-row items-center justify-between">
							<DialogTitle>New Clearance Request</DialogTitle>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowNewRequestForm(false)}
								className="lg:hidden"
							>
								<X className="h-5 w-5" />
							</Button>
						</DialogHeader>
						<div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-70px)]">
							<ClearanceRequestForm
								user={user}
								onSubmit={async (data) => {
									setUserClearanceRequests((prev) => {
										const exists = prev.some((r) => r.id === data.id);
										if (exists) return prev;
										return [data, ...prev];
									});
									setShowNewRequestForm(false);
									await fetchRequestDetails(data.id);
									// Fetch updated notifications
									try {
										const token = localStorage.getItem("authToken");
										const API_BASE_URL =
											process.env.NEXT_PUBLIC_API_URL ||
											"http://localhost:5000/api";
										const notificationsResponse = await axios.get(
											`${API_BASE_URL}/clearance/notifications`,
											{
												headers: { Authorization: `Bearer ${token}` },
											}
										);
										if (notificationsResponse.data.status === "success") {
											const fetchedNotifications =
												notificationsResponse.data.data || [];
											const uniqueNotifications = fetchedNotifications.filter(
												(n, index, self) =>
													index === self.findIndex((t) => t.id === n.id)
											);
											setNotifications(
												uniqueNotifications.map((n) => ({
													...n,
													clearanceRequestId: n.clearanceRequestId || null,
													read: n.read ?? false,
												}))
											);
											setUnreadCount(
												uniqueNotifications.filter((n) => !n.read).length
											);
										}
									} catch (error) {
										console.error(
											"Error fetching notifications after submission:",
											error
										);
									}
								}}
								onCancel={() => setShowNewRequestForm(false)}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
