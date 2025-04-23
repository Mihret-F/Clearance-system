"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Loader2,
	Upload,
	FileText,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

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
	const [formType, setFormType] = useState<
		"TERMINATION" | "ID_REPLACEMENT" | "TEACHER_CLEARANCE"
	>("TERMINATION");
	const [terminationReasons, setTerminationReasons] = useState([]);
	const [idReplacementReasons, setIdReplacementReasons] = useState([]);
	const [selectedTerminationReason, setSelectedTerminationReason] =
		useState("");
	const [selectedIdReplacementReason, setSelectedIdReplacementReason] =
		useState("");
	const [teacherReason, setTeacherReason] = useState("");
	const [documents, setDocuments] = useState<string[]>([]);
	const [uploadingDocument, setUploadingDocument] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [workflow, setWorkflow] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<
		{ id: string; name: string }[]
	>([]);
	const [termsAccepted, setTermsAccepted] = useState(false);

	useEffect(() => {
		const fetchFormData = async () => {
			try {
				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
				const token = localStorage.getItem("authToken");

				// Fetch termination reasons
				const terminationResponse = await axios.get(
					`${API_BASE_URL}/clearance/termination-reasons`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// Fetch ID replacement reasons
				const idReplacementResponse = await axios.get(
					`${API_BASE_URL}/clearance/id-replacement-reasons`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// Set the fetched data
				if (terminationResponse.data.status === "success") {
					setTerminationReasons(terminationResponse.data.data);
				}

				if (idReplacementResponse.data.status === "success") {
					setIdReplacementReasons(idReplacementResponse.data.data);
				}

				// Set initial workflow based on form type
				fetchWorkflow(formType);
			} catch (error) {
				console.error("Error fetching form data:", error);
				setError("Failed to load form data. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchFormData();
	}, []);

	const fetchWorkflow = async (selectedFormType: string) => {
		try {
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const token = localStorage.getItem("authToken");

			const response = await axios.get(`${API_BASE_URL}/clearance/workflow`, {
				params: {
					formType: selectedFormType,
					programId: user.student?.programId || null,
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.status === "success") {
				setWorkflow(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching workflow:", error);
		}
	};

	const handleFormTypeChange = (
		value: "TERMINATION" | "ID_REPLACEMENT" | "TEACHER_CLEARANCE"
	) => {
		setFormType(value);
		fetchWorkflow(value);
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingDocument(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const token = localStorage.getItem("authToken");

			// Create upload progress tracker
			const config = {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
				onUploadProgress: (progressEvent: any) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
					setUploadProgress(percentCompleted);
				},
			};

			const response = await axios.post(
				`${API_BASE_URL}/clearance/upload-temp-document`,
				formData,
				config
			);

			if (response.data.status === "success") {
				const documentId = response.data.data.id;
				setDocuments([...documents, documentId]);
				setUploadedFiles([
					...uploadedFiles,
					{ id: documentId, name: file.name },
				]);
			}
		} catch (error) {
			console.error("Error uploading document:", error);
			setError("Failed to upload document. Please try again.");
		} finally {
			setUploadingDocument(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (formType === "TERMINATION" && !selectedTerminationReason) {
			setError("Please select a termination reason");
			return;
		}

		if (formType === "ID_REPLACEMENT" && !selectedIdReplacementReason) {
			setError("Please select an ID replacement reason");
			return;
		}

		if (formType === "TEACHER_CLEARANCE" && !teacherReason) {
			setError("Please provide a reason for teacher clearance");
			return;
		}

		if (documents.length === 0) {
			setError("Please upload at least one supporting document");
			return;
		}

		if (!termsAccepted) {
			setError("Please accept the terms and conditions");
			return;
		}

		setSubmitting(true);
		setError("");

		try {
			// Prepare form data
			const formData = {
				formType,
				terminationReasonId:
					formType === "TERMINATION" ? selectedTerminationReason : null,
				idReplacementReasonId:
					formType === "ID_REPLACEMENT" ? selectedIdReplacementReason : null,
				teacherReason: formType === "TEACHER_CLEARANCE" ? teacherReason : null,
				documentIds: documents,
				workflow: workflow.map((step: any) => step.id),
			};

			// Submit the form
			await onSubmit(formData);
		} catch (error) {
			console.error("Error submitting form:", error);
			setError("Failed to submit form. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="p-6 space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Request Type</h3>
				<RadioGroup
					value={formType}
					onValueChange={(value: any) => handleFormTypeChange(value)}
					className="grid grid-cols-1 sm:grid-cols-3 gap-4"
				>
					<div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
						<RadioGroupItem value="TERMINATION" id="termination" />
						<Label htmlFor="termination" className="flex-1 cursor-pointer">
							Student Termination
						</Label>
					</div>
					<div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
						<RadioGroupItem value="ID_REPLACEMENT" id="id_replacement" />
						<Label htmlFor="id_replacement" className="flex-1 cursor-pointer">
							ID Card Replacement
						</Label>
					</div>
					<div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
						<RadioGroupItem value="TEACHER_CLEARANCE" id="teacher_clearance" />
						<Label
							htmlFor="teacher_clearance"
							className="flex-1 cursor-pointer"
						>
							Teacher Clearance
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Conditional form fields based on form type */}
			{formType === "TERMINATION" && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Termination Reason</h3>
					<div className="grid gap-4">
						{terminationReasons.length > 0 ? (
							<RadioGroup
								value={selectedTerminationReason}
								onValueChange={setSelectedTerminationReason}
								className="space-y-2"
							>
								{terminationReasons.map((reason: any) => (
									<div
										key={reason.id}
										className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 p-3 rounded-lg"
									>
										<RadioGroupItem
											value={reason.id}
											id={`reason-${reason.id}`}
										/>
										<Label
											htmlFor={`reason-${reason.id}`}
											className="flex-1 cursor-pointer"
										>
											<div>
												<p className="font-medium">{reason.reason}</p>
												{reason.description && (
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{reason.description}
													</p>
												)}
											</div>
										</Label>
									</div>
								))}
							</RadioGroup>
						) : (
							<div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
								<p className="text-gray-500 dark:text-gray-400">
									No termination reasons available
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{formType === "ID_REPLACEMENT" && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">ID Replacement Reason</h3>
					<div className="grid gap-4">
						{idReplacementReasons.length > 0 ? (
							<RadioGroup
								value={selectedIdReplacementReason}
								onValueChange={setSelectedIdReplacementReason}
								className="space-y-2"
							>
								{idReplacementReasons.map((reason: any) => (
									<div
										key={reason.id}
										className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 p-3 rounded-lg"
									>
										<RadioGroupItem
											value={reason.id}
											id={`id-reason-${reason.id}`}
										/>
										<Label
											htmlFor={`id-reason-${reason.id}`}
											className="flex-1 cursor-pointer"
										>
											<div>
												<p className="font-medium">{reason.reason}</p>
												{reason.description && (
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{reason.description}
													</p>
												)}
											</div>
										</Label>
									</div>
								))}
							</RadioGroup>
						) : (
							<div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
								<p className="text-gray-500 dark:text-gray-400">
									No ID replacement reasons available
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{formType === "TEACHER_CLEARANCE" && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Clearance Reason</h3>
					<div className="grid gap-2">
						<Label htmlFor="teacher-reason">Reason for clearance</Label>
						<Textarea
							id="teacher-reason"
							placeholder="Please provide a detailed reason for your clearance request"
							value={teacherReason}
							onChange={(e) => setTeacherReason(e.target.value)}
							className="min-h-[120px]"
						/>
					</div>
				</div>
			)}

			{/* Supporting Documents */}
			<div className="space-y-4">
				<h3 className="text-lg font-medium">Supporting Documents</h3>
				<div className="grid gap-4">
					<div
						className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
						onClick={() => document.getElementById("document-upload").click()}
					>
						<input
							type="file"
							id="document-upload"
							className="hidden"
							onChange={handleFileUpload}
							disabled={uploadingDocument}
						/>
						<Upload className="h-8 w-8 mx-auto text-gray-400" />
						<p className="mt-2 text-sm font-medium">
							{uploadingDocument
								? "Uploading..."
								: "Click to upload supporting documents"}
						</p>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
							PDF, PNG, JPG or DOCX up to 10MB
						</p>
					</div>

					{uploadingDocument && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Uploading document...</span>
								<span>{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="h-2" />
						</div>
					)}

					{/* List of uploaded files */}
					{uploadedFiles.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Uploaded Documents</h4>
							<div className="space-y-2">
								{uploadedFiles.map((file) => (
									<div
										key={file.id}
										className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
									>
										<div className="flex items-center gap-2">
											<FileText className="h-5 w-5 text-blue-500" />
											<span className="text-sm">{file.name}</span>
										</div>
										<CheckCircle className="h-5 w-5 text-green-500" />
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Workflow Preview */}
			{workflow.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Approval Workflow</h3>
					<div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
							Your request will go through the following approval steps:
						</p>
						<div className="space-y-2">
							{workflow.map((step: any, index: number) => (
								<div key={step.id} className="flex items-center gap-3">
									<div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
										{index + 1}
									</div>
									<div>
										<p className="text-sm font-medium">
											{step.office?.officeName || "Unknown Office"}
										</p>
										{step.description && (
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{step.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Terms and Conditions */}
			<div className="space-y-4">
				<div className="flex items-center space-x-2">
					<Checkbox
						id="terms"
						checked={termsAccepted}
						onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
					/>
					<Label htmlFor="terms" className="text-sm">
						I confirm that all information provided is accurate and complete. I
						understand that providing false information may result in
						disciplinary action.
					</Label>
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={submitting || !termsAccepted}
					className="gap-2"
				>
					{submitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						"Submit Request"
					)}
				</Button>
			</div>
		</form>
	);
}
