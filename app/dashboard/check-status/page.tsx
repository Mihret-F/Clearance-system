"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Search,
	CheckCircle,
	Clock,
	AlertTriangle,
	FileText,
	Download,
	Loader2,
} from "lucide-react";
import axios from "axios";
import { officeIconMap } from "../requester/page";

export default function CheckStatusPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [clearanceRequest, setClearanceRequest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const searchParams = useSearchParams();
	const requestId = searchParams.get("requestId");

	useEffect(() => {
		const fetchClearanceRequest = async () => {
			if (!requestId) {
				setError("No request ID provided");
				setLoading(false);
				return;
			}

			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				// Fetch request details
				const requestResponse = await axios.get(
					`${API_BASE_URL}/clearance/requests`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				if (requestResponse.data.status !== "success") {
					throw new Error("Failed to fetch clearance requests");
				}

				const request = requestResponse.data.data.find(
					(req) => req.id === requestId
				);
				if (!request) {
					throw new Error("Clearance request not found");
				}

				// Fetch workflow details
				const workflowResponse = await axios.get(
					`${API_BASE_URL}/clearance/workflow/${requestId}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				if (workflowResponse.data.status !== "success") {
					throw new Error("Failed to fetch workflow");
				}

				const workflow = workflowResponse.data.data;
				const departments = workflow.steps.map((step) => {
					const action = request.approvalActions?.find(
						(a) => a.approver.office?.name === step.officeName
					);
					return {
						id: `dept-${step.stepOrder}`,
						name: step.officeName,
						icon: officeIconMap[step.officeName] || FileText,
						description: step.description || `${step.officeName} clearance`,
						status: step.status.toLowerCase(),
						approvedDate:
							step.status === "APPROVED" && action ? action.actionDate : null,
						approver: {
							name: step.approverName || "Pending Assignment",
							position: step.officeName,
							avatar: `/placeholder.svg?height=40&width=40&text=${
								step.approverName ? step.approverName.charAt(0) : "P"
							}`,
						},
						comments:
							step.status === "REJECTED" && action
								? action.comment || "No reason provided"
								: step.status === "APPROVED" && action
								? action.comment || "Approved"
								: step.status === "PENDING"
								? "Awaiting review"
								: null,
					};
				});

				// Build timeline from approval actions and submission
				const timeline = [
					{
						date: request.submittedAt,
						title: "Clearance Request Submitted",
						description: `You submitted a request for ${request.formType.replace(
							/_/g,
							" "
						)} clearance.`,
						icon: FileText,
						iconColor: "text-primary",
						bgColor: "bg-primary/10",
					},
					...(request.approvalActions
						?.filter((action) => action.status !== "PENDING")
						.map((action) => ({
							date: action.actionDate,
							title: `${action.approver.office?.name} Clearance ${
								action.status === "APPROVED" ? "Approved" : "Rejected"
							}`,
							description: `${action.approver.user.firstName} ${
								action.approver.user.fatherName
							} ${
								action.status === "APPROVED" ? "approved" : "rejected"
							} the clearance.`,
							icon: action.status === "APPROVED" ? CheckCircle : AlertTriangle,
							iconColor:
								action.status === "APPROVED"
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400",
							bgColor:
								action.status === "APPROVED"
									? "bg-green-100 dark:bg-green-900/20"
									: "bg-red-100 dark:bg-red-900/20",
						})) || []),
				].sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
				);

				setClearanceRequest({
					id: request.id,
					type: request.formType.replace(/_/g, " "),
					submittedDate: request.submittedAt,
					status: request.status,
					progress: workflow.progress,
					expectedCompletionDate: new Date(
						new Date(request.submittedAt).getTime() + 30 * 24 * 60 * 60 * 1000
					).toISOString(),
					departments,
					timeline,
				});
			} catch (err) {
				console.error("Error fetching clearance request:", err);
				setError("Failed to load clearance request details");
			} finally {
				setLoading(false);
			}
		};

		fetchClearanceRequest();
	}, [requestId]);

	if (loading) {
		return (
			<div className="container py-6 max-w-full flex justify-center items-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
			</div>
		);
	}

	if (error || !clearanceRequest) {
		return (
			<div className="container py-6 max-w-full">
				<Card className="p-8 text-center">
					<AlertTriangle className="h-12 w-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						{error || "No clearance request found"}
					</h3>
					<Button variant="outline" onClick={() => window.history.back()}>
						Go Back
					</Button>
				</Card>
			</div>
		);
	}

	const filteredDepartments = clearanceRequest.departments.filter(
		(dept) =>
			dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			dept.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getStatusIcon = (status) => {
		switch (status) {
			case "approved":
				return (
					<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
				);
			case "in-progress":
			case "pending":
				return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
			case "rejected":
				return (
					<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
				);
			default:
				return null;
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "approved":
				return (
					<Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
						Approved
					</Badge>
				);
			case "in-progress":
			case "pending":
				return (
					<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
						{status === "in-progress" ? "In Progress" : "Pending"}
					</Badge>
				);
			case "rejected":
				return (
					<Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
						Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container py-6 max-w-full">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold">Clearance Status</h1>
					<p className="text-muted-foreground">
						Track the progress of your clearance request
					</p>
				</div>
				<Button variant="outline" className="gap-2 w-full sm:w-auto">
					<Download className="h-4 w-4" />
					Download Report
				</Button>
			</div>

			{/* Clearance Overview */}
			<Card className="p-6 mb-6">
				<div className="flex flex-col md:flex-row gap-6">
					<div className="flex-1">
						<h2 className="text-lg font-medium mb-4">Request Overview</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
							<div>
								<p className="text-sm text-muted-foreground">Request Type</p>
								<p className="font-medium">{clearanceRequest.type}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Request ID</p>
								<p className="font-medium">{clearanceRequest.id}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Submitted Date</p>
								<p className="font-medium">
									{new Date(
										clearanceRequest.submittedDate
									).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Expected Completion
								</p>
								<p className="font-medium">
									{new Date(
										clearanceRequest.expectedCompletionDate
									).toLocaleDateString()}
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<p className="font-medium">Overall Progress</p>
								<Badge
									variant={
										clearanceRequest.progress < 40 ? "outline" : "default"
									}
								>
									{clearanceRequest.progress}% Complete
								</Badge>
							</div>
							<Progress value={clearanceRequest.progress} className="h-2" />
						</div>
					</div>

					<div className="flex-1">
						<h2 className="text-lg font-medium mb-4">Approval Summary</h2>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg text-center">
								<div className="flex justify-center mb-2">
									<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
								<p className="text-sm text-muted-foreground">Approved</p>
								<p className="text-2xl font-bold">
									{
										clearanceRequest.departments.filter(
											(d) => d.status === "approved"
										).length
									}
								</p>
							</div>

							<div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-center">
								<div className="flex justify-center mb-2">
									<Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
								<p className="text-sm text-muted-foreground">In Progress</p>
								<p className="text-2xl font-bold">
									{
										clearanceRequest.departments.filter(
											(d) =>
												d.status === "in-progress" || d.status === "pending"
										).length
									}
								</p>
							</div>

							<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
								<div className="flex justify-center mb-2">
									<Clock className="h-8 w-8 text-gray-400" />
								</div>
								<p className="text-sm text-muted-foreground">Pending</p>
								<p className="text-2xl font-bold">
									{
										clearanceRequest.departments.filter(
											(d) => d.status === "pending"
										).length
									}
								</p>
							</div>

							<div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg text-center">
								<div className="flex justify-center mb-2">
									<AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
								</div>
								<p className="text-sm text-muted-foreground">Rejected</p>
								<p className="text-2xl font-bold">
									{
										clearanceRequest.departments.filter(
											(d) => d.status === "rejected"
										).length
									}
								</p>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Department Status */}
			<div className="mb-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
					<h2 className="text-lg font-medium">Department Status</h2>
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search departments..."
							className="pl-9"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					{filteredDepartments.map((department) => (
						<motion.div
							key={department.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="p-4">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<department.icon className="h-5 w-5 text-primary" />
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
											<div>
												<h3 className="font-medium">{department.name}</h3>
												<p className="text-sm text-muted-foreground">
													{department.description}
												</p>
											</div>
											<div className="flex items-center gap-2">
												{getStatusBadge(department.status)}
												{department.approvedDate && (
													<Badge variant="outline">
														Approved on{" "}
														{new Date(
															department.approvedDate
														).toLocaleDateString()}
													</Badge>
												)}
											</div>
										</div>

										{department.comments && (
											<div className="mb-3 p-2 bg-muted rounded-md">
												<p className="text-sm">{department.comments}</p>
											</div>
										)}

										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarImage
													src={department.approver.avatar}
													alt={department.approver.name}
												/>
												<AvatarFallback>
													{department.approver.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-xs font-medium">
													{department.approver.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{department.approver.position}
												</p>
											</div>
										</div>
									</div>

									<div className="flex-shrink-0">
										{getStatusIcon(department.status)}
									</div>
								</div>
							</Card>
						</motion.div>
					))}

					{filteredDepartments.length === 0 && (
						<Card className="p-8 text-center">
							<Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">No departments found</h3>
							<p className="text-muted-foreground mb-4">
								No departments match your search criteria
							</p>
							<Button variant="outline" onClick={() => setSearchQuery("")}>
								Clear Search
							</Button>
						</Card>
					)}
				</div>
			</div>

			{/* Timeline */}
			<Card className="p-6">
				<h2 className="text-lg font-medium mb-4">Clearance Timeline</h2>
				<div className="relative pl-6 space-y-6">
					<div className="absolute top-0 bottom-0 left-2.5 w-px bg-gray-200 dark:bg-gray-700" />
					{clearanceRequest.timeline.map((event, index) => (
						<div key={index} className="relative">
							<div
								className={`absolute -left-6 w-5 h-5 rounded-full ${event.bgColor} flex items-center justify-center`}
							>
								<event.icon className={`h-3 w-3 ${event.iconColor}`} />
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-1">
									{new Date(event.date).toLocaleDateString()}
								</p>
								<h3 className="font-medium">{event.title}</h3>
								<p className="text-sm text-muted-foreground">
									{event.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}
