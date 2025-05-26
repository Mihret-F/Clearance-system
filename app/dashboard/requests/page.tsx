"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Search, FileText, X, Plus, Clock } from "lucide-react";
import { ClearanceStatusCard } from "@/components/dashboard/ClearanceStatusCard";
import { ClearanceRequestForm } from "@/components/dashboard/ClearanceRequestForm";
import axios from "axios";

export default function RequestsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("all");
	const [showNewRequestForm, setShowNewRequestForm] = useState(false);
	const [user, setUser] = useState(null);
	const [clearanceRequests, setClearanceRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const storedUser = localStorage.getItem("user");
				const token = localStorage.getItem("authToken");
				if (!token || !storedUser) {
					router.push("/login");
					return;
				}

				setUser(JSON.parse(storedUser));

				const API_BASE_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

				const requestsResponse = await axios.get(
					`${API_BASE_URL}/clearance/requests`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (requestsResponse.data.status === "success") {
					setClearanceRequests(requestsResponse.data.data || []);
				}
			} catch (err) {
				console.error("Error fetching clearance requests:", err);
				setError("Failed to load clearance requests. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [router]);

	const filteredRequests = clearanceRequests.filter((request) => {
		const matchesSearch =
			request.formType.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.status.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesFilter =
			filter === "all" ||
			(filter === "pending" && request.status === "PENDING") ||
			(filter === "approved" &&
				(request.status === "APPROVED" || request.status === "COMPLETED")) ||
			(filter === "rejected" && request.status === "REJECTED");

		return matchesSearch && matchesFilter;
	});

	if (loading) {
		return (
			<div className="container py-6 max-w-full flex items-center justify-center">
				<Clock className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container py-6 max-w-full flex items-center justify-center">
				<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
					<p className="text-red-500 text-center">{error}</p>
					<Button
						onClick={() => router.push("/dashboard/requester")}
						className="mt-4"
					>
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-6 max-w-full">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold">My Clearance Requests</h1>
					<p className="text-muted-foreground">
						View and manage your clearance requests
					</p>
				</div>
				<Button
					onClick={() => setShowNewRequestForm(true)}
					className="gap-2 w-full sm:w-auto"
				>
					<Plus className="h-4 w-4" />
					New Request
				</Button>
			</div>

			{/* Search and Filter */}
			<div className="flex flex-col sm:flex-row gap-3 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search requests..."
						className="pl-9"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Tabs
					defaultValue="all"
					value={filter}
					onValueChange={setFilter}
					className="w-full sm:w-auto"
				>
					<TabsList className="grid grid-cols-4 w-full sm:w-auto">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="pending">Pending</TabsTrigger>
						<TabsTrigger value="approved">Approved</TabsTrigger>
						<TabsTrigger value="rejected">Rejected</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Requests List */}
			<div className="space-y-4">
				{filteredRequests.length > 0 ? (
					filteredRequests.map((request) => (
						<motion.div
							key={request.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<ClearanceStatusCard request={request} />
						</motion.div>
					))
				) : (
					<Card className="p-8 text-center">
						<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No requests found</h3>
						<p className="text-muted-foreground mb-4 max-w-md mx-auto">
							{searchQuery
								? "No requests match your search criteria"
								: filter !== "all"
								? `You don't have any ${filter} requests`
								: "You haven't submitted any clearance requests yet"}
						</p>
						{searchQuery ? (
							<Button variant="outline" onClick={() => setSearchQuery("")}>
								Clear Search
							</Button>
						) : (
							<Button onClick={() => setShowNewRequestForm(true)}>
								Create New Request
							</Button>
						)}
					</Card>
				)}
			</div>

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
								setClearanceRequests((prev) => [data, ...prev]);
								setShowNewRequestForm(false);
							}}
							onCancel={() => setShowNewRequestForm(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
