import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { WorkflowProgress } from "@/components/dashboard/WorkflowProgress";
import {
	FileText,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	ChevronRight,
} from "lucide-react";
import axios from "axios";

interface ClearanceStatusCardProps {
	request: {
		id: string | number;
		formType: string;
		status: string;
		submittedAt: string;
		currentApprover: string;
		workflow: string[];
		currentStep: number;
		rejectedStep?: number;
		rejectionReason?: string;
		reason: string;
		userInfo: {
			firstName: string;
			fatherName: string;
			grandfatherName: string;
			department: string;
			programType?: string;
			programCategory?: string;
		};
	};
}

export function ClearanceStatusCard({ request }: ClearanceStatusCardProps) {
	const [showDetails, setShowDetails] = useState(false);
	const [workflowSteps, setWorkflowSteps] = useState([]);

	// Helper function to safely get the rejected office name
	const getRejectedOfficeName = (
		workflow: string[],
		rejectedStep?: number
	): string => {
		if (!Array.isArray(workflow) || workflow.length === 0) {
			return "Unknown";
		}
		const stepIndex = rejectedStep ?? 0;
		return workflow[stepIndex] || "Unknown";
	};

	useEffect(() => {
		const fetchWorkflowSteps = async () => {
			if (!request || !request.id) return;

			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const response = await axios.get(
					`${API_BASE_URL}/clearance/workflow/${request.id}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (response.data.status === "success") {
					setWorkflowSteps(response.data.data.steps || []);
				}
			} catch (error) {
				console.error("Error fetching workflow steps:", error);
			}
		};

		fetchWorkflowSteps();
	}, [request]);

	const getStatusBadge = () => {
		switch (request.status) {
			case "APPROVED":
			case "COMPLETED":
				return <Badge variant="success">Approved</Badge>;
			case "REJECTED":
				return <Badge variant="destructive">Rejected</Badge>;
			case "PENDING":
				return <Badge variant="outline">Pending</Badge>;
			case "RESUBMITTED":
				return <Badge variant="outline">Resubmitted</Badge>;
			default:
				return <Badge variant="secondary">{request.status}</Badge>;
		}
	};
	const getStatusIcon = () => {
		switch (request.status) {
			case "APPROVED":
			case "COMPLETED":
				return (
					<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
						<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
				);
			case "REJECTED":
				return (
					<div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
						<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
					</div>
				);
			case "PENDING":
			case "RESUBMITTED":
				return (
					<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
						<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
				);
			default:
				return (
					<div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
						<FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
					</div>
				);
		}
	};

	return (
		<>
			<motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
				<Card
					className="p-4 cursor-pointer"
					onClick={() => setShowDetails(true)}
				>
					<div className="flex items-start gap-4">
						{getStatusIcon()}
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-medium">
										{request.formType.replace(/_/g, " ")}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Submitted on{" "}
										{new Date(request.submittedAt).toLocaleDateString()}
									</p>
								</div>
								{getStatusBadge()}
							</div>

							<div className="mt-2">
								{request.status === "PENDING" ? (
									<p className="text-sm text-gray-600 dark:text-gray-400">
										Awaiting approval from:{" "}
										<span className="font-medium">
											{request.currentApprover}
										</span>
									</p>
								) : request.status === "REJECTED" ? (
									<p className="text-sm text-red-600 dark:text-red-400">
										Rejected by:{" "}
										<span className="font-medium">
											{getRejectedOfficeName(
												request.workflow,
												request.rejectedStep
											)}
										</span>
									</p>
								) : null}
							</div>

							<Button
								variant="ghost"
								size="sm"
								className="mt-2 gap-1 text-primary"
								onClick={(e) => {
									e.stopPropagation();
									setShowDetails(true);
								}}
							>
								View Details <ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</Card>
			</motion.div>

			<Dialog open={showDetails} onOpenChange={setShowDetails}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Clearance Request Details</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold">
									{request.formType?.replace(/_/g, " ") || request.type}
								</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Submitted on{" "}
									{new Date(request.submittedAt).toLocaleDateString()}
								</p>
							</div>
							{getStatusBadge()}
						</div>

						<div className="space-y-2">
							<h3 className="text-lg font-medium">User Information</h3>
							<Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
								<p>
									<strong>Name:</strong> {request.userInfo?.firstName}{" "}
									{request.userInfo?.fatherName}{" "}
									{request.userInfo?.grandfatherName}
								</p>
								<p>
									<strong>Department:</strong>{" "}
									{request.userInfo?.department || "N/A"}
								</p>
								{request.userInfo?.programType && (
									<p>
										<strong>Program:</strong> {request.userInfo?.programType} (
										{request.userInfo?.programCategory})
									</p>
								)}
								<p>
									<strong>Reason:</strong>{" "}
									{request.reason
										? request.reason.charAt(0).toUpperCase() +
										  request.reason.slice(1)
										: "Not specified"}
								</p>
							</Card>
						</div>

						{request.status === "REJECTED" && request.rejectionReason && (
							<div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
								<p className="text-xs text-red-700 dark:text-red-400">
									<span className="font-medium">Rejected: </span>
									{request.rejectionReason}
								</p>
							</div>
						)}

						<div className="space-y-2">
							<h3 className="text-lg font-medium">Approval Workflow</h3>
							<WorkflowProgress
								steps={workflowSteps.map((step: any) => step.officeName)}
								currentStep={request.currentStep}
								rejectedStep={request.rejectedStep}
								workflowSteps={workflowSteps}
							/>
						</div>

						<div className="space-y-2">
							<h3 className="text-lg font-medium">Current Status</h3>
							<Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
								{request.status === "PENDING" ? (
									<div className="flex items-center gap-3">
										<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
										<p>
											Your request is currently awaiting approval from{" "}
											<span className="font-medium">
												{request.currentApprover}
											</span>
											.
										</p>
									</div>
								) : request.status === "APPROVED" ? (
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
										<p>
											Your request has been fully approved. You can now download
											your clearance certificate.
										</p>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
										<p>
											Your request was rejected by{" "}
											<span className="font-medium">
												{getRejectedOfficeName(
													request.workflow,
													request.rejectedStep
												)}
											</span>
											. Please review the rejection reason and resubmit if
											necessary.
										</p>
									</div>
								)}
							</Card>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowDetails(false)}>
								Close
							</Button>
							{request.status === "REJECTED" && (
								<Button>Resubmit Request</Button>
							)}
							{request.status === "APPROVED" && (
								<Button>Download Certificate</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
