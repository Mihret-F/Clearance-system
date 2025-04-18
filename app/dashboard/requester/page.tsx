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
import { clearanceRequests } from "@/data/clearance-requests";

const clearanceStages = [
	{
		id: "finance",
		name: "Finance",
		icon: CreditCard,
		description: "Financial clearance",
		status: "completed",
	},
	{
		id: "library",
		name: "Library",
		icon: Library,
		description: "Library clearance",
		status: "in-progress",
	},
	{
		id: "hostel",
		name: "Hostel",
		icon: Building,
		description: "Hostel clearance",
		status: "pending",
	},
	{
		id: "department",
		name: "Department",
		icon: Users,
		description: "Departmental clearance",
		status: "pending",
	},
	{
		id: "sports",
		name: "Sports",
		icon: FileCheck,
		description: "Sports equipment clearance",
		status: "pending",
	},
	{
		id: "certificates",
		name: "Certificates",
		icon: FileText,
		description: "Certificate verification",
		status: "pending",
	},
];

const notifications = [
	{
		id: 1,
		title: "Document Submitted",
		message:
			"Your ID card replacement documents have been submitted successfully.",
		time: "2 hours ago",
		read: false,
		type: "success",
	},
	{
		id: 2,
		title: "Library Clearance",
		message:
			"Your library clearance is awaiting approval from the Chief Librarian.",
		time: "1 day ago",
		read: true,
		type: "pending",
	},
	{
		id: 3,
		title: "Deadline Reminder",
		message:
			"The deadline for graduation clearance submission is May 15, 2024.",
		time: "2 days ago",
		read: false,
		type: "warning",
	},
	{
		id: 4,
		title: "Finance Clearance",
		message: "Your finance clearance has been approved.",
		time: "1 week ago",
		read: true,
		type: "success",
	},
];

const pendingDocuments = [
	{
		id: 1,
		name: "Identity Card Copy",
		status: "submitted",
		department: "Admin",
	},
	{
		id: 2,
		name: "Hostel Clearance Form",
		status: "pending",
		department: "Hostel",
	},
	{
		id: 3,
		name: "Library Return Receipt",
		status: "pending",
		department: "Library",
	},
	{
		id: 4,
		name: "Departmental No-Dues",
		status: "pending",
		department: "Department",
	},
];

// Updated NavItem component to use Next.js Link
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

// Update the component to ensure proper dark mode support
export default function RequesterDashboard() {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState(null);
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
	const [userData, setUserData] = useState(null); // Added userData state

	const overallProgress = 35; // Percentage of clearance completion

	useEffect(() => {
		// Check if dark mode preference exists
		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Check if user is logged in
		const storedUser = localStorage.getItem("user");
		if (!storedUser) {
			router.push("/login");
			return;
		}

		setUser(JSON.parse(storedUser));
		setUserData({ programType: "Regular", academicCategory: "Undergraduate" }); // Mock user data

		// Check for mobile/tablet view
		const checkMobile = () => {
			const isMobile = window.innerWidth < 1024;
			setSidebarOpen(!isMobile);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, [router]);

	useEffect(() => {
		// Load clearance requests for the current user
		if (user) {
			// Filter requests for the current user
			const userRequests = clearanceRequests.filter(
				(req) => req.userId === user.id
			);
			setUserClearanceRequests(userRequests);
		}
	}, [user]);

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

	const handleUploadSubmit = () => {
		if (!selectedFile) return;

		setUploading(true);
		setUploadProgress(0);

		// Simulate upload progress
		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setUploading(false);
					setUploadModalOpen(false);
					// Reset after successful upload
					setTimeout(() => {
						setSelectedFile(null);
						setUploadProgress(0);
					}, 500);
					return 100;
				}
				return prev + 5;
			});
		}, 200);
	};

	const handleLogout = () => {
		localStorage.removeItem("user");
		router.push("/login");
	};

	const handleNewRequest = () => {
		setShowNewRequestForm(true);
	};

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
									<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
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
				{/* Sidebar Header */}
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

				{/* User Profile */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage
								src="/placeholder.svg?height=100&width=100&text=User"
								alt={user.name}
							/>
							<AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="font-medium truncate text-gray-900 dark:text-gray-100">
								{user.name || "John Doe"}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{user.id || "1"} • {user.role || "Student"}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
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

				{/* Sidebar Footer */}
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

			{/* Sidebar Backdrop - Mobile Only */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Main Content */}
			<main
				className={`transition-all duration-300 ${
					sidebarOpen ? "lg:ml-7" : "lg:ml-0"
				} pt-16 lg:pt-0`}
			>
				<div className="max-w-7xl mx-auto px-2 py-4">
					{/* Dashboard Header */}
					<div className="mb-6">
						<h1 className="text-2xl font-bold">
							Welcome back, {user.name?.split(" ")[0] || "John"}
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
												{notifications.filter((n) => !n.read).length > 0 && (
													<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
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

					{/* Main Dashboard Content */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Left Column - Progress Overview */}
						<Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold">Clearance Progress</h2>
								<Badge className="bg-red-500 text-white px-3 py-1 rounded-full">
									{overallProgress}% Complete
								</Badge>
							</div>

							<div className="space-y-4">
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600 dark:text-gray-400">
											Overall Progress
										</span>
										<span className="font-medium">{overallProgress}%</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className="bg-blue-600 h-2 rounded-full"
											style={{ width: `${overallProgress}%` }}
										></div>
									</div>
								</div>

								<div className="space-y-4 mt-4">
									{clearanceStages.map((stage) => (
										<div key={stage.id} className="flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
													stage.status === "completed"
														? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
														: stage.status === "in-progress"
														? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
														: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
												}`}
											>
												<stage.icon className="h-5 w-5" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex justify-between">
													<p className="font-medium">{stage.name}</p>
													<Badge
														variant={
															stage.status === "completed"
																? "success"
																: stage.status === "in-progress"
																? "outline"
																: "secondary"
														}
														className={
															stage.status === "completed"
																? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
																: stage.status === "in-progress"
																? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
																: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
														}
													>
														{stage.status === "completed"
															? "Approved"
															: stage.status === "in-progress"
															? "In Progress"
															: "Pending"}
													</Badge>
												</div>
												<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
													{stage.description}
												</p>
											</div>
										</div>
									))}
								</div>

								<Link
									href="/dashboard/check-status"
									className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-2"
								>
									<span>View Detailed Progress</span>
									<ChevronRight className="h-4 w-4 ml-1" />
								</Link>
							</div>
						</Card>

						{/* Right Column - Quick Actions */}
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

					{/* Notifications & Documents Section */}
					<Card className="mt-6 p-6 bg-white dark:bg-gray-800 shadow-sm">
						<Tabs defaultValue="notifications">
							<div className="flex items-center justify-between mb-4">
								<TabsList>
									<TabsTrigger value="documents">Pending Documents</TabsTrigger>
									<TabsTrigger value="notifications">
										Recent Notifications
									</TabsTrigger>
									<TabsTrigger value="schedule">Upcoming Deadlines</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="documents" className="space-y-4">
								{pendingDocuments.map((doc) => (
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
													{doc.department} •{" "}
													{doc.status.charAt(0).toUpperCase() +
														doc.status.slice(1)}
												</p>
											</div>
										</div>

										{doc.status === "pending" ? (
											<Button
												size="sm"
												className="gap-1"
												onClick={() => setUploadModalOpen(true)}
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
								))}
							</TabsContent>

							<TabsContent value="notifications" className="space-y-4">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className={`p-4 rounded-lg ${
											notification.read
												? "bg-gray-50 dark:bg-gray-800"
												: "bg-blue-50 dark:bg-blue-900/10"
										} border border-gray-200 dark:border-gray-700`}
									>
										<div className="flex gap-3">
											<div
												className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
													notification.type === "success"
														? "bg-green-100 dark:bg-green-900/20"
														: notification.type === "warning"
														? "bg-yellow-100 dark:bg-yellow-900/20"
														: "bg-blue-100 dark:bg-blue-900/20"
												}`}
											>
												{notification.type === "success" && (
													<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
												)}
												{notification.type === "warning" && (
													<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
												)}
												{notification.type === "pending" && (
													<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												)}
											</div>
											<div>
												<h4 className="font-medium">{notification.title}</h4>
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
							</TabsContent>

							<TabsContent value="schedule" className="space-y-4">
								<div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
										</div>
										<div>
											<h4 className="font-medium">
												Graduation Clearance Deadline
											</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												May 15, 2024 (14 days left)
											</p>
										</div>
									</div>
								</div>

								<div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
										</div>
										<div>
											<h4 className="font-medium">Library Returns Deadline</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												May 10, 2024 (9 days left)
											</p>
										</div>
									</div>
								</div>

								<div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<h4 className="font-medium">Hostel Checkout</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												May 20, 2024 (19 days left)
											</p>
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</Card>

					{/* Clearance Requests */}
					<Card className="mt-6 p-6 bg-white dark:bg-gray-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">My Clearance Requests</h2>
							<Link href="/dashboard/requests">
								<Button variant="outline" size="sm" className="gap-1">
									<span>View All</span>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</Link>
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

				{/* Upload Document Modal */}
				<Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Upload Document</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Document Type</label>
								<select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
									<option value="">Select document type</option>
									<option value="id-card">ID Card Copy</option>
									<option value="library-clearance">Library Clearance</option>
									<option value="hostel-clearance">Hostel Clearance</option>
									<option value="finance-receipt">Finance Receipt</option>
								</select>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">
									Document For Department
								</label>
								<select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
									<option value="">Select department</option>
									<option value="admin">Administration</option>
									<option value="library">Library</option>
									<option value="hostel">Hostel</option>
									<option value="finance">Finance</option>
									<option value="academic">Academic Department</option>
								</select>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Description</label>
								<textarea
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 min-h-[80px]"
									placeholder="Add a brief description of this document..."
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
									disabled={!selectedFile || uploading}
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

				{/* New Request Form Dialog */}
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
								onSubmit={(data) => {
									// Handle form submission
									console.log("Form submitted:", data);
									setShowNewRequestForm(false);

									// Add the new request to the list
									const newRequest = {
										id: `req-${Date.now()}`,
										userId: user.id,
										type:
											data.requestType === "termination"
												? `Student Termination (${
														userData?.programType || "Regular"
												  })`
												: data.requestType === "id_replacement"
												? `ID Card Replacement (${
														(userData?.academicCategory || "",
														userData?.programType || "Regular")
												  })`
												: `Faculty Clearance (${data.requestType})`,
										status: "Pending",
										submittedAt: new Date().toISOString(),
										currentApprover: data.workflow[0],
										workflow: data.workflow,
										currentStep: 0,
										documents: data.documents,
									};

									setUserClearanceRequests((prev) => [newRequest, ...prev]);
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
