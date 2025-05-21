"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
	ChevronRight,
	ChevronLeft,
	Check,
	AlertCircle,
	Upload,
	FileText,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

// Custom scrollbar styles
const customScrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
@media (max-width: 640px) {
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
}
`;

interface ClearanceRequestFormProps {
	user: any;
	onSubmit: (data: any) => void;
	onCancel: () => void;
}

export function ClearanceRequestForm({
	user,
	onSubmit,
	onCancel,
}: ClearanceRequestFormProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState({
		requestType: "",
		reasonId: "",
		otherReason: "",
		comments: "",
		documents: [] as File[], // Store actual File objects
		documentsRequired: false,
		programType: "",
		programCategory: "",
	});
	const [workflow, setWorkflow] = useState<string[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [userData, setUserData] = useState<any>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [hasMounted, setHasMounted] = useState(false);
	const [formTypes, setFormTypes] = useState([]);
	const [reasons, setReasons] = useState<any[]>([]);
	const [documentTypes, setDocumentTypes] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setSubmitting] = useState(false);
	const [isLoadingReasons, setIsLoadingReasons] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false); // Confirmation checkbox state

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// Add custom scrollbar styles
	useEffect(() => {
		const styleElement = document.createElement("style");
		styleElement.textContent = customScrollbarStyles;
		document.head.appendChild(styleElement);
		return () => document.head.removeChild(styleElement);
	}, []);

	// Fetch form types and document types
	useEffect(() => {
		const fetchFormData = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const formTypesResponse = await axios.get(
					`${API_BASE_URL}/clearance/form-types`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (formTypesResponse.data.status === "success") {
					setFormTypes(formTypesResponse.data.data);
				}

				const documentTypesResponse = await axios.get(
					`${API_BASE_URL}/clearance/document-types`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (documentTypesResponse.data.status === "success") {
					setDocumentTypes(documentTypesResponse.data.data);
				}
			} catch (error) {
				console.error("Error fetching form data:", error);
				setError("Failed to load form data. Please try again.");
			}
		};
		fetchFormData();
	}, []);

	// Fetch reasons and workflow when requestType changes
	useEffect(() => {
		if (!formData.requestType) return;

		const fetchReasonsAndWorkflow = async () => {
			setIsLoadingReasons(true);
			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const reasonsResponse = await axios.get(
					`${API_BASE_URL}/clearance/reasons/${formData.requestType.toUpperCase()}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (reasonsResponse.data.status === "success") {
					setReasons(reasonsResponse.data.data);
				} else {
					setReasons([]);
				}

				await fetchWorkflow(formData.requestType);
			} catch (error) {
				console.error("Error fetching reasons or workflow:", error);
				setError("Failed to load data. Please try again.");
				setReasons([]);
			} finally {
				setIsLoadingReasons(false);
			}
		};
		fetchReasonsAndWorkflow();
	}, [formData.requestType]);

	// Set user data and program details
	useEffect(() => {
		if (!user) return;
		setUserData(user);
		if (user.role === "STUDENT" && user.student?.program) {
			setFormData((prev) => ({
				...prev,
				programType: user.student.program.type || "",
				programCategory: user.student.program.category || "",
			}));
		}
	}, [user]);

	const steps = [
		{ id: "type", label: "Request Type" },
		{ id: "details", label: "Request Details" },
		{ id: "documents", label: "Supporting Documents" },
		{ id: "review", label: "Review & Submit" },
	];

	const handleInputChange = async (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}

		if (field === "requestType") {
			setReasons([]);
			setFormData((prev) => ({
				...prev,
				reasonId: "",
				otherReason: "",
				documents: [],
			}));
			await fetchWorkflow(value);
		}
	};

	const fetchWorkflow = async (formType: string) => {
		try {
			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			const payload = {
				username: user?.username,
				formType: formType.toUpperCase(),
				programType: user?.student?.program?.type || undefined,
				programCategory: user?.student?.program?.category || undefined,
			};

			const response = await axios.post(
				`${API_BASE_URL}/clearance/workflow`,
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data) {
				setWorkflow(response.data.steps.map((step: any) => step.officeName));
			} else {
				setError("Failed to fetch workflow");
			}
		} catch (error) {
			console.error("Error fetching workflow:", error);
			setError("Failed to fetch workflow. Please try again.");
		}
	};

	const validateProgramForRequestType = (requestType: string, program: any) => {
		if (requestType === "TERMINATION" || requestType === "ID_REPLACEMENT") {
			return true;
		}
		return false;
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;

		const files = Array.from(e.target.files);
		const allowedTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const maxSize = 10 * 1024 * 1024; // 10MB

		const validFiles = files.filter((file) => {
			if (!allowedTypes.includes(file.type)) {
				setErrors((prev) => ({
					...prev,
					documents: `Invalid file type: ${file.name}. Only PDF, JPG, PNG, DOCX allowed.`,
				}));
				return false;
			}
			if (file.size > maxSize) {
				setErrors((prev) => ({
					...prev,
					documents: `File too large: ${file.name}. Max size is 10MB.`,
				}));
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		setSelectedFile(validFiles[0]);
		setIsUploading(true);
		setUploadProgress(0);

		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setIsUploading(false);
					setFormData((prev) => ({
						...prev,
						documents: [...prev.documents, ...validFiles],
					}));
					setErrors((prev) => {
						const newErrors = { ...prev };
						delete newErrors.documents;
						return newErrors;
					});
					return 0;
				}
				return prev + 10;
			});
		}, 300);
	};

	const validateStep = () => {
		const newErrors: Record<string, string> = {};

		switch (currentStep) {
			case 0:
				if (!formData.requestType) {
					newErrors.requestType = "Please select a request type";
				}
				break;

			case 1:
				if (!formData.reasonId) {
					newErrors.reasonId = "Please select a reason";
				}
				if (
					(formData.requestType === "TERMINATION" ||
						formData.requestType === "TEACHER_CLEARANCE") &&
					formData.reasonId === "Others" &&
					!formData.otherReason
				) {
					newErrors.otherReason = "Please specify the reason";
				}
				break;

			case 2:
				if (formData.documentsRequired && formData.documents.length === 0) {
					newErrors.documents =
						"Please upload at least one supporting document";
				}
				break;

			case 3:
				if (!isConfirmed) {
					newErrors.confirmation = "Please confirm the request details";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateStep()) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => prev - 1);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form data before submission:", formData);

		if (currentStep < steps.length - 1) {
			handleNext();
			return;
		}

		if (!validateStep()) return;

		try {
			setSubmitting(true);
			setError(null);

			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			const submitFormData = new FormData();
			submitFormData.append("formType", formData.requestType);
			submitFormData.append("programType", formData.programType);
			submitFormData.append("programCategory", formData.programCategory);

			if (formData.requestType === "TERMINATION") {
				if (formData.reasonId) {
					submitFormData.append("terminationReasonId", formData.reasonId);
				}
				if (formData.reasonId === "Others" && formData.otherReason) {
					submitFormData.append("terminationReason", formData.otherReason);
				}
			} else if (formData.requestType === "ID_REPLACEMENT") {
				if (formData.reasonId) {
					submitFormData.append("idReplacementReasonId", formData.reasonId);
				}
				// Optionally handle "Others" for ID_REPLACEMENT
				if (formData.reasonId === "Others" && formData.otherReason) {
					submitFormData.append("idReplacementReason", formData.otherReason);
				}
			} else if (formData.requestType === "TEACHER_CLEARANCE") {
				if (formData.reasonId) {
					submitFormData.append("teacherClearanceReasonId", formData.reasonId);
				}
				if (formData.reasonId === "Others" && formData.otherReason) {
					submitFormData.append("teacherReason", formData.otherReason);
				}
			}

			if (formData.comments) {
				submitFormData.append("comments", formData.comments);
			}

			if (formData.documents.length > 0) {
				formData.documents.forEach((file, index) => {
					submitFormData.append(`documents`, file);
				});
			}

			const response = await axios.post(
				`${API_BASE_URL}/clearance/submit-request`,
				submitFormData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.status === "success") {
				onSubmit(response.data.data);
			} else {
				setError(response.data.message || "Failed to submit request");
			}
		} catch (error) {
			console.error("Error submitting request:", error);
			setError(
				(error as any).response?.data?.message ||
					"Failed to submit request. Please try again."
			);
		} finally {
			setSubmitting(false);
		}
	};

	const renderStepIndicator = () => (
		<div className="mb-3 sm:mb-4">
			<div className="md:hidden">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-900 dark:text-white">
						Step {currentStep + 1} of {steps.length}
					</span>
					<span className="text-sm text-gray-600 dark:text-gray-400">
						{steps[currentStep].label}
					</span>
				</div>
				<div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
					<div
						className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
						style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
					/>
				</div>
			</div>
			<div className="hidden md:block">
				<div
					className="flex justify-between overflow-x-auto pb-2 gap-2 sm:gap-4 custom-scrollbar"
					style={{ scrollbarWidth: "thin" }}
				>
					{steps.map((step, index) => (
						<div
							key={step.id}
							className={`flex flex-col items-center relative min-w-[80px] sm:min-w-[100px] ${
								index === currentStep
									? "text-primary"
									: index < currentStep
									? "text-green-600 dark:text-green-400"
									: "text-gray-400 dark:text-gray-500"
							}`}
						>
							<div className="flex items-center justify-center">
								<div
									className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors
              ${
								index === currentStep
									? "border-primary bg-primary/10"
									: index < currentStep
									? "border-green-600 dark:border-green-400 bg-green-100 dark:bg-green-900/20"
									: "border-gray-300 dark:border-gray-700"
							}`}
								>
									{index < currentStep ? (
										<Check className="w-4 h-4 sm:w-5 sm:h-5" />
									) : (
										<span className="text-xs sm:text-sm">{index + 1}</span>
									)}
								</div>
								{index !== steps.length - 1 && (
									<div
										className={`absolute w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] h-[2px] left-[calc(50%+1rem)] sm:left-[calc(50%+1.25rem)] top-4 sm:top-5 -z-10
                ${
									index < currentStep
										? "bg-green-600 dark:bg-green-400"
										: "bg-gray-300 dark:bg-gray-700"
								}`}
									/>
								)}
							</div>
							<span className="text-xs sm:text-sm mt-2 text-center">
								{step.label}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const renderRequestTypeStep = () => (
		<div className="space-y-3 sm:space-y-6">
			<Card className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
				<h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4 text-gray-900 dark:text-white">
					User Information
				</h3>
				<div className="grid gap-2 sm:gap-4 md:grid-cols-2">
					<div>
						<Label className="text-gray-700 dark:text-gray-300">
							Full Name
						</Label>
						<Input
							value={`${user?.firstName || ""} ${user?.fatherName || ""} ${
								user?.grandfatherName || ""
							}`}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>
					<div>
						<Label className="text-gray-700 dark:text-gray-300">Username</Label>
						<Input
							value={user?.username || ""}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>
					<div>
						<Label className="text-gray-700 dark:text-gray-300">Email</Label>
						<Input
							value={user?.email || ""}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>
					<div>
						<Label className="text-gray-700 dark:text-gray-300">Role</Label>
						<Input
							value={user?.role || ""}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>
					{user?.role === "STUDENT" && user?.student && (
						<>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Academic Status
								</Label>
								<Input
									value={user?.student?.academicStatus || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Current Year
								</Label>
								<Input
									value={user?.student?.currentYear || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Semester
								</Label>
								<Input
									value={user?.student?.semester || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Department
								</Label>
								<Input
									value={user?.student?.department?.name || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Program
								</Label>
								<Input
									value={user?.student?.program?.name || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Program Type
								</Label>
								<Input
									value={user?.student?.program?.type || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Program Category
								</Label>
								<Input
									value={user?.student?.program?.category || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Start Date
								</Label>
								<Input
									value={
										user?.student?.startDate
											? new Date(user.student.startDate).toLocaleDateString()
											: ""
									}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
						</>
					)}
					{user?.role === "TEACHER" && user?.teacher && (
						<>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Position
								</Label>
								<Input
									value={user?.teacher?.position || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Department
								</Label>
								<Input
									value={user?.teacher?.department?.name || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Employment Status
								</Label>
								<Input
									value={user?.teacher?.employmentStatus || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Years of Service
								</Label>
								<Input
									value={user?.teacher?.yearsOfService || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Hire Date
								</Label>
								<Input
									value={
										user?.teacher?.hireDate
											? new Date(user.teacher.hireDate).toLocaleDateString()
											: ""
									}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
						</>
					)}
				</div>
			</Card>
			<div className="space-y-2">
				<Label
					htmlFor="requestType"
					className="text-gray-700 dark:text-gray-300"
				>
					Request Type <span className="text-red-500">*</span>
				</Label>
				<Select
					value={formData.requestType}
					onValueChange={(value) => handleInputChange("requestType", value)}
				>
					<SelectTrigger
						id="requestType"
						className={errors.requestType ? "border-red-500" : ""}
					>
						<SelectValue placeholder="Select request type" />
					</SelectTrigger>
					<SelectContent>
						{user?.role === "STUDENT" ? (
							<>
								<SelectItem value="TERMINATION">Student Termination</SelectItem>
								<SelectItem value="ID_REPLACEMENT">
									ID Card Replacement
								</SelectItem>
							</>
						) : (
							<SelectItem value="TEACHER_CLEARANCE">
								Teacher Clearance
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				{errors.requestType && (
					<p className="text-sm text-red-500">{errors.requestType}</p>
				)}
			</div>
		</div>
	);

	const renderDetailsStep = () => (
		<div className="space-y-4 sm:space-y-6">
			<div className="space-y-2">
				<Label className="text-gray-700 dark:text-gray-300">
					Reason for Request <span className="text-red-500">*</span>
				</Label>
				{isLoadingReasons ? (
					<div className="flex items-center gap-2">
						<Loader2 className="h-5 w-5 animate-spin text-gray-700 dark:text-gray-300" />
						<span className="text-gray-700 dark:text-gray-300">
							Loading reasons...
						</span>
					</div>
				) : reasons.length === 0 ? (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						No reasons available for this request type.
					</p>
				) : (
					<RadioGroup
						value={formData.reasonId}
						onValueChange={(value) => handleInputChange("reasonId", value)}
						className="grid grid-cols-1 md:grid-cols-2 gap-2"
					>
						{reasons.map((reason) => (
							<div key={reason.id} className="flex items-center space-x-2">
								<RadioGroupItem value={reason.id} id={reason.id} />
								<Label
									htmlFor={reason.id}
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									{reason.reason}
								</Label>
							</div>
						))}
						{(formData.requestType === "TERMINATION" ||
							formData.requestType === "TEACHER_CLEARANCE") && (
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Others" id="others" />
								<Label
									htmlFor="others"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Others (Please specify)
								</Label>
							</div>
						)}
					</RadioGroup>
				)}
				{errors.reasonId && (
					<p className="text-sm text-red-500">{errors.reasonId}</p>
				)}
			</div>

			{formData.reasonId === "Others" && (
				<div className="space-y-2">
					<Label
						htmlFor="otherReason"
						className="text-gray-700 dark:text-gray-300"
					>
						Please specify reason <span className="text-red-500">*</span>
					</Label>
					<Textarea
						id="otherReason"
						value={formData.otherReason}
						onChange={(e) => handleInputChange("otherReason", e.target.value)}
						placeholder="Please specify your reason"
						className={`text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 ${
							errors.otherReason ? "border-red-500" : ""
						}`}
					/>
					{errors.otherReason && (
						<p className="text-sm text-red-500">{errors.otherReason}</p>
					)}
				</div>
			)}

			{workflow.length > 0 && (
				<div className="mt-6">
					<Label className="block mb-2 text-gray-700 dark:text-gray-300">
						Approval Workflow
					</Label>
					<Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
						<div className="relative">
							<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
							<div
								className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
								style={{ width: `0%` }}
							/>
							<div
								className="relative flex overflow-x-auto pb-2 custom-scrollbar"
								style={{ scrollbarWidth: "thin" }}
							>
								{workflow.map((step, index) => (
									<div
										key={index}
										className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] px-1 sm:px-2 flex-shrink-0"
									>
										<div className="relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
											<span className="text-xs sm:text-sm">{index + 1}</span>
										</div>
										<div className="mt-2 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[100px] text-gray-700 dark:text-gray-300">
											{step}
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>
			)}
		</div>
	);

	const renderDocumentsStep = () => (
		<div className="space-y-4 sm:space-y-6">
			<div className="space-y-2">
				<Label className="text-gray-700 dark:text-gray-300">
					Supporting Documents{" "}
					{formData.documentsRequired && (
						<span className="text-red-500">*</span>
					)}
				</Label>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
					{formData.documentsRequired
						? "Please upload the required documents to proceed with your request."
						: "Document upload is optional. Supported formats: PDF, JPG, PNG, DOCX (max 10MB)."}
				</p>
				<div
					className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer ${
						errors.documents
							? "border-red-500"
							: "border-gray-300 dark:border-gray-700"
					}`}
					onClick={() => document.getElementById("file-upload")?.click()}
				>
					<input
						type="file"
						id="file-upload"
						className="hidden"
						onChange={handleFileUpload}
						multiple
						accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
					/>
					<Upload className="h-10 w-10 mx-auto text-gray-400" />
					<p className="mt-2 font-medium text-gray-700 dark:text-gray-300">
						{selectedFile
							? selectedFile.name
							: "Drag & drop files or click to browse"}
					</p>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						{selectedFile
							? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
							: "PDF, JPG, PNG, DOCX up to 10MB"}
					</p>
				</div>
				{errors.documents && (
					<p className="text-sm text-red-500">{errors.documents}</p>
				)}
			</div>

			{isUploading && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-gray-700 dark:text-gray-300">
							Uploading...
						</span>
						<span className="text-gray-700 dark:text-gray-300">
							{uploadProgress}%
						</span>
					</div>
					<Progress value={uploadProgress} className="h-2" />
				</div>
			)}

			{formData.documents.length > 0 && (
				<div className="space-y-2">
					<Label className="text-gray-700 dark:text-gray-300">
						Uploaded Documents
					</Label>
					<div className="space-y-2">
						{formData.documents.map((doc, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
										<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<p className="font-medium text-gray-700 dark:text-gray-300">
											{doc.name}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
											{new Date().toLocaleTimeString()}
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											documents: prev.documents.filter((_, i) => i !== index),
										}));
									}}
									className="text-gray-700 dark:text-gray-300"
								>
									Remove
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-2">
				<Label
					htmlFor="additionalComments"
					className="text-gray-700 dark:text-gray-300"
				>
					Additional Comments (Optional)
				</Label>
				<Textarea
					id="additionalComments"
					value={formData.comments}
					onChange={(e) => handleInputChange("comments", e.target.value)}
					placeholder="Add any additional information about the uploaded documents"
					className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
				/>
			</div>
		</div>
	);

	const renderReviewStep = () => (
		<div className="space-y-4 sm:space-y-6">
			<Card className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
				<h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-gray-900 dark:text-white">
					Request Summary
				</h3>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label className="text-sm text-gray-500 dark:text-gray-400">
								Request Type
							</Label>
							<p className="font-medium text-gray-900 dark:text-white">
								{formData.requestType === "TERMINATION"
									? "Student Termination"
									: formData.requestType === "ID_REPLACEMENT"
									? "ID Card Replacement"
									: "Teacher Clearance"}
							</p>
						</div>
						<div>
							<Label className="text-sm text-gray-500 dark:text-gray-400">
								Reason
							</Label>
							<p className="font-medium text-gray-900 dark:text-white">
								{formData.reasonId === "Others"
									? formData.otherReason
									: reasons.find((r) => r.id === formData.reasonId)?.reason ||
									  ""}
							</p>
						</div>
						{user?.role === "STUDENT" && (
							<>
								<div>
									<Label className="text-sm text-gray-500 dark:text-gray-400">
										Program Type
									</Label>
									<p className="font-medium text-gray-900 dark:text-white">
										{formData.programType}
									</p>
								</div>
								<div>
									<Label className="text-sm text-gray-500 dark:text-gray-400">
										Program Category
									</Label>
									<p className="font-medium text-gray-900 dark:text-white">
										{formData.programCategory}
									</p>
								</div>
							</>
						)}
					</div>
					{formData.comments && (
						<div>
							<Label className="text-sm text-gray-500 dark:text-gray-400">
								Additional Comments
							</Label>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								{formData.comments}
							</p>
						</div>
					)}
					<div>
						<Label className="text-sm text-gray-500 dark:text-gray-400">
							Supporting Documents
						</Label>
						<div className="flex flex-wrap gap-2 mt-1">
							{formData.documents.length > 0 ? (
								formData.documents.map((doc, index) => (
									<Badge key={index} variant="secondary">
										{doc.name}
									</Badge>
								))
							) : (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									No documents attached
								</p>
							)}
						</div>
					</div>
				</div>
			</Card>
			<div className="space-y-2">
				<Label className="text-gray-700 dark:text-gray-300">
					Approval Workflow
				</Label>
				<Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
					<div className="relative">
						<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
						<div
							className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
							style={{ width: `0%` }}
						/>
						<div className="relative flex justify-between overflow-x-auto pb-2">
							{workflow.map((step, index) => (
								<div
									key={index}
									className="flex flex-col items-center min-w-[100px] px-2"
								>
									<div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
										<span className="text-sm">{index + 1}</span>
									</div>
									<div className="mt-2 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] text-gray-700 dark:text-gray-300">
										{step}
									</div>
								</div>
							))}
						</div>
					</div>
				</Card>
			</div>
			<div className="p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20 rounded-lg">
				<div className="flex gap-3">
					<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
					<div>
						<h4 className="font-medium text-yellow-800 dark:text-yellow-300">
							Important Information
						</h4>
						<p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
							By submitting this request, you confirm that all information
							provided is accurate and complete. Your request will be routed
							through the approval workflow shown above. You will be notified of
							any updates.
						</p>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Checkbox
					id="terms"
					checked={isConfirmed}
					onCheckedChange={(checked) => setIsConfirmed(!!checked)}
				/>
				<Label
					htmlFor="terms"
					className="text-sm text-gray-700 dark:text-gray-300"
				>
					I confirm that all information provided is accurate and I understand
					the clearance process.
				</Label>
			</div>
			{errors.confirmation && (
				<p className="text-sm text-red-500">{errors.confirmation}</p>
			)}
		</div>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 0:
				return renderRequestTypeStep();
			case 1:
				return renderDetailsStep();
			case 2:
				return renderDocumentsStep();
			case 3:
				return renderReviewStep();
			default:
				return null;
		}
	};

	return (
		<div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
			{renderStepIndicator()}
			<div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-6 text-gray-900 dark:text-gray-100 overflow-hidden">
				<div className="max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
					{renderCurrentStep()}
				</div>
				<div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
					{currentStep > 0 ? (
						<Button variant="outline" onClick={handleBack} className="gap-2">
							<ChevronLeft className="h-4 w-4" /> Back
						</Button>
					) : (
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					)}
					{currentStep < steps.length - 1 ? (
						<Button onClick={handleNext} className="gap-2">
							Next <ChevronRight className="h-4 w-4" />
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							className="gap-2"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" /> Submitting...
								</>
							) : (
								<>
									<Check className="h-4 w-4" /> Submit Request
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
