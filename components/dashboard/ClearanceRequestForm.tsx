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

// Add this CSS at the top of the file, after the imports
// Add custom scrollbar styles
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

// Define the approval workflows for different scenarios
const approvalWorkflows = {
	// Student Termination (Post Graduate, Extension)
	termination_pg_extension: [
		"Academic Advisor",
		"Department Head",
		"Dormitory Head",
		"Library (A) Chief of Circulation",
		"Library (B) Chief of Circulation (Main)",
		"Library (C)",
		"Post Graduate Dean",
		"Registrar",
	],

	// ID Card Replacement (Post Graduate, Regular)
	id_replacement_pg_regular: [
		"Academic Advisor",
		"Library (A) Chief of Circulation",
		"Library (B)",
		"Main Library",
		"Book Store",
		"Campus Police",
		"Dormitory Head",
		"Students' Cafeteria Head",
		"Finance Office",
		"Registrar",
	],

	// Student Termination (Post Graduate, Regular)
	termination_pg_regular: [
		"Academic Advisor",
		"Department Head",
		"Library (A) Chief of Circulation",
		"Library (B) Chief of Circulation (Main)",
		"Library (C)",
		"Post Graduate Dean",
		"Students' Cafeteria Head",
		"Students' Dormitory Head",
		"Registrar",
	],

	// ID Card Replacement (Post Graduate, Extension)
	id_replacement_pg_extension: [
		"Academic Advisor",
		"Continuing Education",
		"Library (A) Chief of Circulation",
		"Library (B)",
		"Main Library",
		"Book Store",
		"Campus Police",
		"Finance Office",
		"Registrar",
	],

	// ID Card Replacement (Regular student)
	id_replacement_regular: [
		"Academic Advisor",
		"Department Head",
		"Library (A) Chief of Circulation",
		"Library (B)",
		"Main Library",
		"Book Store",
		"Campus Police",
		"Dormitory Head",
		"Students' Cafeteria Head",
		"Registrar",
	],

	// ID Card Replacement (Summer)
	id_replacement_summer: [
		"Academic Advisor",
		"Continuing Education",
		"Library (A) Chief of Circulation",
		"Library (B)",
		"Main Library",
		"Campus Police",
		"Dormitory Head",
		"Students' Cafeteria Head",
		"Finance Office",
		"Registrar",
	],

	// Student Termination (Summer)
	termination_summer: [
		"Academic Advisor",
		"Department Head",
		"Students' Dormitory Head",
		"Library (A) Chief of Circulation",
		"Library (B) Chief of Circulation (Main)",
		"Main Library",
		"Students' Cafeteria Head",
		"Registrar",
	],

	// Faculty Clearance (Generic)
	faculty_clearance: [
		"Department Head",
		"Library (Main)",
		"Finance Office",
		"Human Resources",
		"Research Office",
		"Dean's Office",
		"Vice President's Office",
		"President's Office",
	],
};

// Sample static data for different user types
const sampleStudentData = {
	regular: {
		id: "STD2024001",
		name: "John Doe",
		fathersName: "Michael Doe",
		program: "Computer Science",
		programType: "Regular",
		academicCategory: "Undergraduate",
		year: 3,
		department: "Computer Science",
		advisor: "Dr. Smith",
		enrollmentDate: "2021-09-01",
		expectedGraduationDate: "2025-06-30",
	},
	postgraduate_regular: {
		id: "STD2024002",
		name: "Jane Smith",
		fathersName: "Robert Smith",
		program: "Data Science",
		programType: "Regular",
		academicCategory: "Masters",
		year: 2,
		department: "Computer Science",
		advisor: "Dr. Johnson",
		enrollmentDate: "2022-09-01",
		expectedGraduationDate: "2024-06-30",
	},
	postgraduate_extension: {
		id: "STD2024003",
		name: "Mike Johnson",
		fathersName: "David Johnson",
		program: "Artificial Intelligence",
		programType: "Extension",
		academicCategory: "PhD",
		year: 1,
		department: "Computer Science",
		advisor: "Dr. Williams",
		enrollmentDate: "2023-09-01",
		expectedGraduationDate: "2027-06-30",
	},
	summer: {
		id: "STD2024005",
		name: "Tom Wilson",
		fathersName: "James Wilson",
		program: "Information Technology",
		programType: "Summer",
		academicCategory: "Undergraduate",
		year: 2,
		department: "Computer Science",
		advisor: "Dr. Anderson",
		enrollmentDate: "2022-09-01",
		expectedGraduationDate: "2026-06-30",
	},
};

const sampleFacultyData = {
	id: "FAC2024001",
	name: "Dr. James Smith",
	position: "Associate Professor",
	department: "Computer Science",
	startDate: "2018-09-01",
	tenure: "Permanent",
	specialization: "Machine Learning",
	officeLocation: "CS Building, Room 301",
};

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
		programCategory: "",
		programType: "",
		withdrawalReason: "",
		otherReason: "",
		idReplacementReason: "",
		comments: "",
		documents: [],
		documentsRequired: false,
	});
	const [workflow, setWorkflow] = useState([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [userData, setUserData] = useState<any>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [hasMounted, setHasMounted] = useState(false);
	const [formTypes, setFormTypes] = useState([]);
	const [terminationReasons, setTerminationReasons] = useState([]);
	const [idReplacementReasons, setIdReplacementReasons] = useState([]);
	const [documentTypes, setDocumentTypes] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setSubmitting] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// Add the style element to the component
	useEffect(() => {
		// Add the custom scrollbar styles to the document
		const styleElement = document.createElement("style");
		styleElement.textContent = customScrollbarStyles;
		document.head.appendChild(styleElement);

		return () => {
			// Clean up the style element when the component unmounts
			document.head.removeChild(styleElement);
		};
	}, []);

	// Determine user type and set appropriate data
	useEffect(() => {
		const fetchFormData = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				// Fetch form types
				const formTypesResponse = await axios.get(
					`${API_BASE_URL}/clearance/form-types`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (formTypesResponse.data.status === "success") {
					setFormTypes(formTypesResponse.data.data);
				}

				// Fetch termination reasons
				const terminationReasonsResponse = await axios.get(
					`${API_BASE_URL}/clearance/termination-reasons`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (terminationReasonsResponse.data.status === "success") {
					setTerminationReasons(terminationReasonsResponse.data.data);
				}

				// Fetch ID replacement reasons
				const idReplacementReasonsResponse = await axios.get(
					`${API_BASE_URL}/clearance/id-replacement-reasons`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (idReplacementReasonsResponse.data.status === "success") {
					setIdReplacementReasons(idReplacementReasonsResponse.data.data);
				}

				// Fetch document types
				const documentTypesResponse = await axios.get(
					`${API_BASE_URL}/clearance/document-types`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
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
	useEffect(() => {
		if (!user) return;

		let data;
		if (user.role === "Faculty") {
			data = sampleFacultyData;
		} else {
			// Determine student type
			if (
				user.academicCategory === "Masters" ||
				user.academicCategory === "PhD"
			) {
				if (user.programType === "Extension") {
					data = sampleStudentData.postgraduate_extension;
				} else {
					data = sampleStudentData.postgraduate_regular;
				}
			} else if (user.programType === "Summer") {
				data = sampleStudentData.summer;
			} else {
				data = sampleStudentData.regular;
			}
		}

		setUserData(data);
	}, [user]);

	const steps = [
		{ id: "type", label: "Request Type" },
		{ id: "details", label: "Request Details" },
		{ id: "documents", label: "Supporting Documents" },
		{ id: "review", label: "Review & Submit" },
	];

	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}

		// Update workflow based on request type and program type
		if (field === "requestType" || field === "programType") {
			updateWorkflow();
		}
	};

	const updateWorkflow = () => {
		const { requestType, programType } = formData;

		if (!requestType) return;

		let workflowKey = "";

		if (user?.role === "Faculty") {
			workflowKey = "faculty_clearance";
		} else {
			// For students
			const isTermination = requestType === "termination";
			const isPG =
				userData?.academicCategory === "Masters" ||
				userData?.academicCategory === "PhD";
			const isExtension = userData?.programType === "Extension";
			const isSummer = userData?.programType === "Summer";

			if (isTermination) {
				if (isPG && isExtension) {
					workflowKey = "termination_pg_extension";
				} else if (isPG && !isExtension) {
					workflowKey = "termination_pg_regular";
				} else if (isSummer) {
					workflowKey = "termination_summer";
				} else {
					workflowKey = "termination_regular";
				}
			} else {
				// ID Replacement
				if (isPG && isExtension) {
					workflowKey = "id_replacement_pg_extension";
				} else if (isPG && !isExtension) {
					workflowKey = "id_replacement_pg_regular";
				} else if (isSummer) {
					workflowKey = "id_replacement_summer";
				} else {
					workflowKey = "id_replacement_regular";
				}
			}
		}

		setWorkflow(approvalWorkflows[workflowKey] || []);
	};

	// Update the renderStepIndicator function to be more responsive
	const renderStepIndicator = () => (
		<div className="mb-3 sm:mb-4">
			{/* Mobile Step Indicator - More compact for small screens */}
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

			{/* Desktop Step Indicator - Scrollable for medium screens */}
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

	const validateStep = () => {
		const newErrors: Record<string, string> = {};

		switch (currentStep) {
			case 0: // Request Type
				if (!formData.requestType) {
					newErrors.requestType = "Please select a request type";
				}

				if (
					formData.requestType === "ID_REPLACEMENT" &&
					!formData.programCategory
				) {
					newErrors.programCategory = "Please select a program category";
				}

				if (
					formData.requestType === "ID_REPLACEMENT" &&
					!formData.programType
				) {
					newErrors.programType = "Please select a program type";
				}
				break;

			case 1: // Request Details
				if (
					formData.requestType === "TERMINATION" &&
					!formData.withdrawalReason
				) {
					newErrors.withdrawalReason = "Please select a withdrawal reason";
				}

				if (formData.withdrawalReason === "Others" && !formData.otherReason) {
					newErrors.otherReason = "Please specify the reason";
				}

				if (
					formData.requestType === "ID_REPLACEMENT" &&
					!formData.idReplacementReason
				) {
					newErrors.idReplacementReason =
						"Please select a reason for ID replacement";
				}
				break;

			case 2: // Documents - Make this optional initially
				// Only validate if we're explicitly requiring documents
				if (formData.documentsRequired && formData.documents.length === 0) {
					newErrors.documents =
						"Please upload at least one supporting document";
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

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;

		const file = e.target.files[0];
		setSelectedFile(file);

		const files = Array.from(e.target.files);
		setIsUploading(true);
		setUploadProgress(0);

		// Simulate file upload
		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setIsUploading(false);
					setFormData((prev) => ({
						...prev,
						documents: [
							...prev.documents,
							...files.map((file) => ({
								name: file.name,
								size: file.size,
								type: file.type,
								uploadedAt: new Date().toISOString(),
							})),
						],
					}));
					return 0;
				}
				return prev + 10;
			});
		}, 300);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (currentStep < steps.length - 1) {
			handleNext();
			return;
		}

		try {
			setSubmitting(true);
			setError(null);

			const token = localStorage.getItem("authToken");
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

			// Create FormData for file uploads
			const submitFormData = new FormData();

			// Add the form type (this is the request type)
			submitFormData.append("formType", formData.requestType);

			// Add reason data based on request type
			if (formData.requestType === "TERMINATION") {
				// Only append if it has a value
				if (formData.withdrawalReason) {
					submitFormData.append(
						"terminationReasonId",
						formData.withdrawalReason
					);
				}

				if (formData.withdrawalReason === "Others" && formData.otherReason) {
					submitFormData.append("teacherReason", formData.otherReason);
				}
			} else if (formData.requestType === "ID_REPLACEMENT") {
				// Only append if it has a value
				if (formData.idReplacementReason) {
					submitFormData.append(
						"idReplacementReasonId",
						formData.idReplacementReason
					);
				}
			} else if (formData.requestType === "TEACHER_CLEARANCE") {
				if (formData.comments) {
					submitFormData.append("teacherReason", formData.comments);
				}
			}

			// Add uploaded files if any
			if (formData.documents && formData.documents.length > 0) {
				formData.documents.forEach((doc, index) => {
					if (doc instanceof File) {
						submitFormData.append(`documents`, doc);
					}
				});
			}

			console.log("Submitting request with data:", {
				formType: formData.requestType,
				terminationReasonId: formData.withdrawalReason || undefined,
				idReplacementReasonId: formData.idReplacementReason || undefined,
				teacherReason: formData.otherReason || formData.comments || undefined,
				documentsCount: formData.documents?.length || 0,
			});

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
				// Pass the new request back to parent component
				onSubmit(response.data.data);
			} else {
				setError(response.data.message || "Failed to submit request");
			}
		} catch (error) {
			console.error("Error submitting request:", error);
			setError(
				error.response?.data?.message ||
					"Failed to submit request. Please try again."
			);
		} finally {
			setSubmitting(false);
		}
	};

	// Update the renderRequestTypeStep function to be more compact on mobile
	const renderRequestTypeStep = () => (
		<div className="space-y-3 sm:space-y-6">
			{/* Auto-filled User Information */}
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
							value={user?.firstName + " " + user?.fatherName}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>
					<div>
						<Label className="text-gray-700 dark:text-gray-300">
							ID Number
						</Label>
						<Input
							value={user?.username || ""}
							disabled
							className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
						/>
					</div>

					{user?.role === "Student" ? (
						<>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Department
								</Label>
								<Input
									value={userData?.department || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Program
								</Label>
								<Input
									value={userData?.program || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Academic Category
								</Label>
								<Input
									value={userData?.academicCategory || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Program Type
								</Label>
								<Input
									value={userData?.programType || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Year of Study
								</Label>
								<Input
									value={userData?.year || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Academic Advisor
								</Label>
								<Input
									value={userData?.advisor || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
						</>
					) : (
						<>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Department
								</Label>
								<Input
									value={userData?.department || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Position
								</Label>
								<Input
									value={userData?.position || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Start Date
								</Label>
								<Input
									value={userData?.startDate || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<Label className="text-gray-700 dark:text-gray-300">
									Office Location
								</Label>
								<Input
									value={userData?.officeLocation || ""}
									disabled
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
								/>
							</div>
						</>
					)}
				</div>
			</Card>

			{/* Request Type Selection */}
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

			{/* Program Category (for ID Replacement only) */}
			{formData.requestType === "ID_REPLACEMENT" && (
				<div className="space-y-2">
					<Label
						htmlFor="programCategory"
						className="text-gray-700 dark:text-gray-300"
					>
						Program Category <span className="text-red-500">*</span>
					</Label>
					<Select
						value={formData.programCategory}
						onValueChange={(value) =>
							handleInputChange("programCategory", value)
						}
					>
						<SelectTrigger
							id="programCategory"
							className={errors.programCategory ? "border-red-500" : ""}
						>
							<SelectValue placeholder="Select program category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="degree">Degree</SelectItem>
							<SelectItem value="diploma">Diploma</SelectItem>
						</SelectContent>
					</Select>
					{errors.programCategory && (
						<p className="text-sm text-red-500">{errors.programCategory}</p>
					)}
				</div>
			)}

			{/* Program Type (for ID Replacement only) */}
			{formData.requestType === "ID_REPLACEMENT" &&
				formData.programCategory && (
					<div className="space-y-2">
						<Label
							htmlFor="programType"
							className="text-gray-700 dark:text-gray-300"
						>
							Program Type <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.programType}
							onValueChange={(value) => handleInputChange("programType", value)}
						>
							<SelectTrigger
								id="programType"
								className={errors.programType ? "border-red-500" : ""}
							>
								<SelectValue placeholder="Select program type" />
							</SelectTrigger>
							<SelectContent>
								{formData.programCategory === "degree" ? (
									<>
										<SelectItem value="regular">Regular</SelectItem>
										<SelectItem value="extension">Extension</SelectItem>
										<SelectItem value="summer">Summer</SelectItem>
									</>
								) : (
									<>
										<SelectItem value="evening">Evening</SelectItem>
										<SelectItem value="summer">Summer</SelectItem>
									</>
								)}
							</SelectContent>
						</Select>
						{errors.programType && (
							<p className="text-sm text-red-500">{errors.programType}</p>
						)}
					</div>
				)}
		</div>
	);

	const renderDetailsStep = () => (
		<div className="space-y-4 sm:space-y-6">
			{formData.requestType === "termination" && (
				<>
					<div className="space-y-2">
						<Label
							htmlFor="withdrawalReason"
							className="text-gray-700 dark:text-gray-300"
						>
							Reason for Withdrawal <span className="text-red-500">*</span>
						</Label>
						<RadioGroup
							value={formData.withdrawalReason}
							onValueChange={(value) =>
								handleInputChange("withdrawalReason", value)
							}
							className="grid grid-cols-1 md:grid-cols-2 gap-2"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Graduated" id="graduated" />
								<Label
									htmlFor="graduated"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Graduated
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="ADR" id="adr" />
								<Label
									htmlFor="adr"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Academic Dismissal with Readmission (ADR)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="AD" id="ad" />
								<Label
									htmlFor="ad"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Academic Dismissal (AD)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Vacation" id="vacation" />
								<Label
									htmlFor="vacation"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Vacation
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="Others" id="others" />
								<Label
									htmlFor="others"
									className="cursor-pointer text-gray-700 dark:text-gray-300"
								>
									Others (Please specify)
								</Label>
							</div>
						</RadioGroup>
						{errors.withdrawalReason && (
							<p className="text-sm text-red-500">{errors.withdrawalReason}</p>
						)}
					</div>

					{formData.withdrawalReason === "Others" && (
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
								onChange={(e) =>
									handleInputChange("otherReason", e.target.value)
								}
								placeholder="Please specify your reason for withdrawal"
								className={`text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 ${
									errors.otherReason ? "border-red-500" : ""
								}`}
							/>
							{errors.otherReason && (
								<p className="text-sm text-red-500">{errors.otherReason}</p>
							)}
						</div>
					)}
				</>
			)}

			{formData.requestType === "ID_REPLACEMENT" && (
				<div className="space-y-2">
					<Label
						htmlFor="idReplacementReason"
						className="text-gray-700 dark:text-gray-300"
					>
						Reason for ID Replacement <span className="text-red-500">*</span>
					</Label>
					<RadioGroup
						value={formData.idReplacementReason}
						onValueChange={(value) =>
							handleInputChange("idReplacementReason", value)
						}
						className="grid grid-cols-1 md:grid-cols-2 gap-2"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Lost" id="lost" />
							<Label
								htmlFor="lost"
								className="cursor-pointer text-gray-700 dark:text-gray-300"
							>
								Lost ID Card
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Damaged" id="damaged" />
							<Label
								htmlFor="damaged"
								className="cursor-pointer text-gray-700 dark:text-gray-300"
							>
								Damaged ID Card
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Expired" id="expired" />
							<Label
								htmlFor="expired"
								className="cursor-pointer text-gray-700 dark:text-gray-300"
							>
								Expired ID Card
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="NameChange" id="nameChange" />
							<Label
								htmlFor="nameChange"
								className="cursor-pointer text-gray-700 dark:text-gray-300"
							>
								Name Change
							</Label>
						</div>
					</RadioGroup>
					{errors.idReplacementReason && (
						<p className="text-sm text-red-500">{errors.idReplacementReason}</p>
					)}
				</div>
			)}

			{(formData.requestType === "clearance" ||
				formData.requestType === "sabbatical" ||
				formData.requestType === "resignation") && (
				<div className="space-y-2">
					<Label
						htmlFor="comments"
						className="text-gray-700 dark:text-gray-300"
					>
						Additional Comments
					</Label>
					<Textarea
						id="comments"
						value={formData.comments}
						onChange={(e) => handleInputChange("comments", e.target.value)}
						placeholder="Please provide any additional information relevant to your request"
						className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
					/>
				</div>
			)}

			{/* Workflow Preview */}
			{workflow.length > 0 && (
				<div className="mt-6">
					<Label className="block mb-2 text-gray-700 dark:text-gray-300">
						Approval Workflow
					</Label>
					<Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
						<div className="relative">
							{/* Progress Line */}
							<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
							<div
								className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
								style={{ width: `0%` }}
							/>

							{/* Steps - Make this scrollable for small screens */}
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
						: "Document upload is optional at this stage. You can add documents now or later if requested."}
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
							: "PDF, PNG, JPG or DOCX up to 10MB"}
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
											{new Date(doc.uploadedAt).toLocaleTimeString()}
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
									: formData.requestType === "TEACHER_CLEARANCE"
									? "Teacher Clearance"
									: ""}
							</p>
						</div>

						{formData.requestType === "ID_REPLACEMENT" && (
							<>
								<div>
									<Label className="text-sm text-gray-500 dark:text-gray-400">
										Program Category
									</Label>
									<p className="font-medium text-gray-900 dark:text-white">
										{formData.programCategory === "degree"
											? "Degree"
											: "Diploma"}
									</p>
								</div>
								<div>
									<Label className="text-sm text-gray-500 dark:text-gray-400">
										Program Type
									</Label>
									<p className="font-medium text-gray-900 dark:text-white">
										{formData.programType === "regular"
											? "Regular"
											: formData.programType === "extension"
											? "Extension"
											: formData.programType === "summer"
											? "Summer"
											: "Evening"}
									</p>
								</div>
							</>
						)}

						{formData.requestType === "termination" && (
							<div>
								<Label className="text-sm text-gray-500 dark:text-gray-400">
									Withdrawal Reason
								</Label>
								<p className="font-medium text-gray-900 dark:text-white">
									{formData.withdrawalReason}
									{formData.withdrawalReason === "Others" &&
										`: ${formData.otherReason}`}
								</p>
							</div>
						)}

						{formData.requestType === "ID_REPLACEMENT" && (
							<div>
								<Label className="text-sm text-gray-500 dark:text-gray-400">
									ID Replacement Reason
								</Label>
								<p className="font-medium text-gray-900 dark:text-white">
									{formData.idReplacementReason}
								</p>
							</div>
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
						{/* Progress Line */}
						<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
						<div
							className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
							style={{ width: `0%` }}
						/>

						{/* Steps - Make this scrollable for small screens */}
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
				<Checkbox id="terms" />
				<Label
					htmlFor="terms"
					className="text-sm text-gray-700 dark:text-gray-300"
				>
					I confirm that all information provided is accurate and I understand
					the clearance process.
				</Label>
			</div>
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

	// Update the main container to be more responsive with better scrolling
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
