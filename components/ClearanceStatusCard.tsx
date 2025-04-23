"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Clock,
	CheckCircle,
	XCircle,
	ChevronRight,
	AlertCircle,
	FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ClearanceStatusCardProps {
	request: any;
}

export function ClearanceStatusCard({ request }: ClearanceStatusCardProps) {
	const [expanded, setExpanded] = useState(false);

	// Format date to readable format
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Get status badge color
	const getStatusColor = (status) => {
		switch (status) {
			case "APPROVED":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "REJECTED":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			case "COMPLETED":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
			default:
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
		}
	};

	// Get status icon
	const StatusIcon = ({ status }) => {
		switch (status) {
			case "APPROVED":
				return (
					<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
				);
			case "REJECTED":
				return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
			case "COMPLETED":
				return (
					<CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
				);
			default:
				return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
		}
	};

	// Get formatted request type
	const getRequestTypeDisplay = (formType) => {
		switch (formType) {
			case "ID_REPLACEMENT":
				return "ID Card Replacement";
			case "TERMINATION":
				return "Termination/Clearance";
			case "TEACHER_CLEARANCE":
				return "Faculty Clearance";
			default:
				return formType;
		}
	};

	// Calculate progress percentage
	const calculateProgress = () => {
		if (!request.approvalActions || request.approvalActions.length === 0)
			return 0;

		const completedSteps = request.approvalActions.filter(
			(action) => action.status === "APPROVED" || action.status === "REJECTED"
		).length;

		const totalSteps = request.approvalActions.length;
		return Math.round((completedSteps / totalSteps) * 100);
	};

	return (
		<div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
			<div className="p-4">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0">
							<StatusIcon status={request.status} />
						</div>
						<div>
							<h3 className="font-medium">
								{getRequestTypeDisplay(request.formType)}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Submitted on {formatDate(request.submittedAt)}
							</p>
						</div>
					</div>
					<Badge className={getStatusColor(request.status)}>
						{request.status === "PENDING"
							? "In Progress"
							: request.status.charAt(0) +
							  request.status.slice(1).toLowerCase()}
					</Badge>
				</div>

				<div className="mt-4">
					<div className="flex justify-between text-sm mb-1">
						<span className="text-gray-600 dark:text-gray-400">Progress</span>
						<span className="font-medium">{calculateProgress()}%</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full"
							style={{ width: `${calculateProgress()}%` }}
						></div>
					</div>
				</div>

				{/* Current step information */}
				<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
					<p className="text-sm font-medium">
						Current Step: {request.currentStep}
					</p>
					{request.approvalActions &&
						request.approvalActions[request.currentStep - 1] && (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Awaiting approval from:{" "}
								{request.approvalActions[request.currentStep - 1].approver
									?.office?.officeName || "Unknown Office"}
							</p>
						)}
				</div>

				{/* Expand/collapse button */}
				<Button
					variant="ghost"
					size="sm"
					className="w-full mt-3 flex items-center justify-center"
					onClick={() => setExpanded(!expanded)}
				>
					<span>{expanded ? "Show Less" : "Show Details"}</span>
					<ChevronRight
						className={`h-4 w-4 ml-1 transition-transform ${
							expanded ? "rotate-90" : ""
						}`}
					/>
				</Button>
			</div>

			{/* Expanded details */}
			{expanded && (
				<motion.div
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: "auto", opacity: 1 }}
					exit={{ height: 0, opacity: 0 }}
					className="border-t border-gray-200 dark:border-gray-700 p-4"
				>
					{/* Approval Timeline */}
					<div className="space-y-4">
						<h4 className="font-medium text-sm">Approval Timeline</h4>

						{request.approvalActions && request.approvalActions.length > 0 ? (
							<div className="space-y-3">
								{request.approvalActions.map((action, index) => (
									<div key={index} className="flex items-start gap-3">
										<div
											className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
												action.status === "APPROVED"
													? "bg-green-100 dark:bg-green-900/20"
													: action.status === "REJECTED"
													? "bg-red-100 dark:bg-red-900/20"
													: "bg-gray-100 dark:bg-gray-800"
											}`}
										>
											{action.status === "APPROVED" ? (
												<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
											) : action.status === "REJECTED" ? (
												<XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
											) : (
												<Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
											)}
										</div>

										<div className="flex-1">
											<div className="flex justify-between">
												<p className="text-sm font-medium">
													{action.approver?.office?.officeName ||
														"Unknown Office"}
												</p>
												<Badge
													variant="outline"
													className={
														action.status === "APPROVED"
															? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
															: action.status === "REJECTED"
															? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
															: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
													}
												>
													{action.status === "PENDING"
														? "Pending"
														: action.status.charAt(0) +
														  action.status.slice(1).toLowerCase()}
												</Badge>
											</div>

											<p className="text-xs text-gray-500 dark:text-gray-400">
												{action.status !== "PENDING"
													? `Processed on ${formatDate(action.actionDate)}`
													: "Awaiting approval"}
											</p>

											{action.comment && (
												<div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
													<p className="text-gray-700 dark:text-gray-300">
														{action.comment}
													</p>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								No approval actions yet.
							</p>
						)}
					</div>

					{/* Documents */}
					{request.documents && request.documents.length > 0 && (
						<div className="mt-6 space-y-3">
							<h4 className="font-medium text-sm">Submitted Documents</h4>
							<div className="space-y-2">
								{request.documents.map((doc, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700"
									>
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
											<span className="text-sm">
												{doc.documentType?.name || "Document"}
											</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												window.open(`/api/documents/${doc.id}`, "_blank")
											}
										>
											View
										</Button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Rejection Information */}
					{request.status === "REJECTED" && request.approvalActions && (
						<div className="mt-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
							<div className="flex items-start gap-2">
								<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-medium text-red-800 dark:text-red-400">
										Request Rejected
									</h4>
									<p className="text-sm text-red-700 dark:text-red-300 mt-1">
										{request.approvalActions.find(
											(a) => a.status === "REJECTED"
										)?.comment ||
											"Your request was rejected. Please review the details and consider submitting a new request."}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* View Full Details Link */}
					<div className="mt-6 text-center">
						<Link href={`/dashboard/requests/${request.id}`}>
							<Button variant="outline" size="sm">
								View Full Details
							</Button>
						</Link>
					</div>
				</motion.div>
			)}
		</div>
	);
}
