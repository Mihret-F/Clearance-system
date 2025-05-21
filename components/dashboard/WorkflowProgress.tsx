"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, XCircle } from "lucide-react";

interface WorkflowProgressProps {
	steps: string[];
	currentStep: number;
	rejectedStep?: number;
	workflowSteps?: { status: string }[];
}

export function WorkflowProgress({
	steps = [],
	currentStep = -1,
	rejectedStep,
	workflowSteps = [],
}: WorkflowProgressProps) {
	return (
		<div className="relative">
			{/* Progress Line */}
			<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
			<div
				className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
				style={{
					width: `${
						rejectedStep !== undefined
							? ((rejectedStep + 1) / steps.length) * 100
							: currentStep >= 0
							? ((currentStep + 1) / steps.length) * 100
							: 0
					}%`,
				}}
			/>

			{/* Steps */}
			<div className="relative flex justify-between">
				{steps.map((step, index) => {
					const stepStatus = workflowSteps[index]?.status || "WAITING";
					const isApproved = stepStatus === "APPROVED";
					const isPending = stepStatus === "PENDING";
					const isRejected =
						stepStatus === "REJECTED" || index === rejectedStep;
					const isWaiting = stepStatus === "WAITING" && !isRejected;

					return (
						<motion.div
							key={step}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className="flex flex-col items-center"
						>
							<motion.div
								animate={
									isRejected
										? { scale: [1, 1.2, 1], backgroundColor: "#ef4444" }
										: isApproved
										? { scale: [1, 1.2, 1], backgroundColor: "#22c55e" }
										: isPending
										? { scale: [1, 1.2, 1], backgroundColor: "#3b82f6" }
										: { scale: [1, 1.2, 1], backgroundColor: "#eab308" }
								}
								transition={{ duration: 0.3 }}
								className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
									isRejected
										? "bg-red-500 text-white dark:bg-red-600"
										: isApproved
										? "bg-green-500 text-white dark:bg-green-600"
										: isPending
										? "bg-blue-500 text-white dark:bg-blue-600"
										: "bg-yellow-500 text-white dark:bg-yellow-600"
								}`}
							>
								{isRejected ? (
									<XCircle className="h-6 w-6" />
								) : isApproved ? (
									<CheckCircle className="h-6 w-6" />
								) : isPending ? (
									<Clock className="h-6 w-6" />
								) : (
									<Circle className="h-6 w-6" />
								)}
							</motion.div>
							<div
								className={`mt-2 text-xs font-medium ${
									isRejected
										? "text-red-500 dark:text-red-400"
										: isApproved
										? "text-green-500 dark:text-green-400"
										: isPending
										? "text-blue-500 dark:text-blue-400"
										: "text-yellow-500 dark:text-yellow-400"
								}`}
							>
								{step}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
