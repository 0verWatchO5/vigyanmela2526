"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StarRating from "../reviews/StarRating";

// Hook for ESC key handling
function useEscapeKey(callback: () => void, enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") callback();
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [enabled, callback]);
}

type RegistrationStatus = "pending" | "approved" | "rejected";

interface TeamMember {
	fullName: string;
	department: string;
	email: string;
	contactNumber: string;
	rollNumber: string;
	yearOfStudy: string;
    linkedinProfile?: string;
}

interface CollegeTeam {
	_id: string;
	teamName: string;
	projectSummary: string;
	projectImage?: string;
	teamSize: number;
	segments: string[];
	teamMembers: TeamMember[];
	slotId?: string;
	roomNo?: string;
	registrationStatus?: RegistrationStatus;
	linkedinId?: string;
	submittedAt?: string;
	createdAt?: string;
}

interface ProjectReview {
	_id: string;
	reviewerName: string;
	reviewerEmail: string;
	rating: number;
	comment: string;
	hidden: boolean;
	createdAt: string;
	updatedAt: string;
}

const STATUS_STYLES: Record<RegistrationStatus, string> = {
	pending: "bg-yellow-500/20 text-yellow-200",
	approved: "bg-green-500/20 text-green-200",
	rejected: "bg-red-500/20 text-red-200",
};

export function CollegeStudentsManager() {
	const [teams, setTeams] = useState<CollegeTeam[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedTeam, setSelectedTeam] = useState<CollegeTeam | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [isStatusUpdating, setIsStatusUpdating] = useState<boolean>(false);
	const [isExporting, setIsExporting] = useState<boolean>(false);
	const [editingSlotRoom, setEditingSlotRoom] = useState<{ [key: string]: { slotId: string; roomNo: string } }>({});
	const [savingSlotRoom, setSavingSlotRoom] = useState<string | null>(null);
	const [slotValidationErrors, setSlotValidationErrors] = useState<Record<string, string>>({});
	const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([]);
	const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
	const [togglingReview, setTogglingReview] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<string>("");
	const [selectedDepartment, setSelectedDepartment] = useState<string>("");
	const [selectedSegment, setSelectedSegment] = useState<string>("");
	const [selectedStatus, setSelectedStatus] = useState<RegistrationStatus | "">("");

	// ESC key handler - must be called at top level
	useEscapeKey(() => setSelectedTeam(null), !!selectedTeam);

	const fetchTeams = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/admin/college-students");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch college registrations");
			}

			setTeams(data.students ?? []);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTeams();
	}, []);

	const fetchProjectReviews = async (projectId: string) => {
		try {
			setLoadingReviews(true);
			const response = await fetch(`/api/admin/reviews/project/${projectId}`);
			const data = await response.json();

			if (data.success) {
				setProjectReviews(data.reviews);
			} else {
				console.error("Failed to fetch reviews:", data.error);
				setProjectReviews([]);
			}
		} catch (error) {
			console.error("Error fetching reviews:", error);
			setProjectReviews([]);
		} finally {
			setLoadingReviews(false);
		}
	};

	const handleToggleReviewVisibility = async (reviewId: string, currentHidden: boolean) => {
		try {
			setTogglingReview(reviewId);
			const response = await fetch(`/api/admin/reviews/${reviewId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hidden: !currentHidden }),
			});

			const data = await response.json();

			if (data.success) {
				// Update local state
				setProjectReviews(projectReviews.map(review => 
					review._id === reviewId ? { ...review, hidden: !currentHidden } : review
				));
			} else {
				alert(data.error || "Failed to update review visibility");
			}
		} catch (error) {
			console.error("Error toggling review visibility:", error);
			alert("An error occurred");
		} finally {
			setTogglingReview(null);
		}
	};

	const handleDeleteReview = async (reviewId: string) => {
		if (!confirm("Are you sure you want to delete this review?")) return;

		try {
			const response = await fetch(`/api/admin/reviews/${reviewId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (data.success) {
				setProjectReviews(projectReviews.filter(review => review._id !== reviewId));
			} else {
				alert(data.error || "Failed to delete review");
			}
		} catch (error) {
			console.error("Error deleting review:", error);
			alert("An error occurred while deleting the review");
		}
	};

	// Fetch reviews when a team is selected
	useEffect(() => {
		if (selectedTeam) {
			fetchProjectReviews(selectedTeam._id);
		} else {
			setProjectReviews([]);
		}
	}, [selectedTeam]);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const res = await fetch("/api/admin/college-students/export");
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Failed to export Excel file");
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "college_registrations.xlsx";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setIsExporting(false);
		}
	};

	const findDuplicateSlotOwner = useCallback(
		(teamId: string, slotValue: string) => {
			const normalized = slotValue.trim().toLowerCase();
			if (!normalized) {
				return undefined;
			}

			for (const team of teams) {
				if (team._id === teamId) continue;
				const candidateRaw = editingSlotRoom[team._id]?.slotId ?? team.slotId ?? "";
				const candidate = candidateRaw.trim().toLowerCase();
				if (candidate && candidate === normalized) {
					return team;
				}
			}

			return undefined;
		},
		[teams, editingSlotRoom]
	);

	const filteredTeams = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		
		return teams.filter((team) => {
			// Text search
			let matchesSearch = true;
			if (query) {
				const matchesTeamName = team.teamName.toLowerCase().includes(query);
				const matchesSummary = team.projectSummary.toLowerCase().includes(query);
				const matchesSegments = team.segments.some((segment) =>
					segment.toLowerCase().includes(query)
				);
				const matchesMember = team.teamMembers.some((member) =>
					[
						member.fullName,
						member.email,
						member.rollNumber,
						member.department,
                        member.linkedinProfile || "",
					]
						.join(" ")
						.toLowerCase()
						.includes(query)
				);

				matchesSearch = matchesTeamName || matchesSummary || matchesSegments || matchesMember;
			}

			// Filter by segment
			const matchesSegmentFilter = !selectedSegment || team.segments.includes(selectedSegment);

			// Filter by year
			const matchesYearFilter = !selectedYear || team.teamMembers.some(m => m.yearOfStudy === selectedYear);

			// Filter by department
			const matchesDepartmentFilter = !selectedDepartment || team.teamMembers.some(m => m.department === selectedDepartment);

			// Filter by status
			const matchesStatusFilter = !selectedStatus || (team.registrationStatus ?? "pending") === selectedStatus;

			return matchesSearch && matchesSegmentFilter && matchesYearFilter && matchesDepartmentFilter && matchesStatusFilter;
		});
	}, [teams, searchQuery, selectedSegment, selectedYear, selectedDepartment, selectedStatus]);

	// Get unique segments, years, and departments
	const uniqueSegments = useMemo(() => {
		const segments = new Set<string>();
		teams.forEach(team => {
			team.segments.forEach(segment => segments.add(segment));
		});
		return Array.from(segments).sort();
	}, [teams]);

	const uniqueYears = useMemo(() => {
		const years = new Set<string>();
		teams.forEach(team => {
			team.teamMembers.forEach(member => {
				if (member.yearOfStudy) years.add(member.yearOfStudy);
			});
		});
		return Array.from(years).sort();
	}, [teams]);

	const uniqueDepartments = useMemo(() => {
		const departments = new Set<string>();
		teams.forEach(team => {
			team.teamMembers.forEach(member => {
				if (member.department) departments.add(member.department);
			});
		});
		return Array.from(departments).sort();
	}, [teams]);

	const statusCounts = useMemo(() => {
		return filteredTeams.reduce(
			(acc, team) => {
				const status = team.registrationStatus ?? "pending";
				acc[status] += 1;
				return acc;
			},
			{ pending: 0, approved: 0, rejected: 0 } as Record<RegistrationStatus, number>
		);
	}, [filteredTeams]);

	const handleDelete = async (teamId: string) => {
		if (!confirm("Are you sure you want to delete this team registration?")) {
			return;
		}

		setIsDeleting(true);
		setDeletingId(teamId);

		try {
			const response = await fetch(`/api/admin/college-students/${teamId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete registration");
			}

			setTeams((prev) => prev.filter((team) => team._id !== teamId));
			if (selectedTeam?._id === teamId) {
				setSelectedTeam(null);
			}
			alert("Registration deleted successfully");
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setIsDeleting(false);
			setDeletingId(null);
		}
	};

	const handleStatusUpdate = async (teamId: string, status: RegistrationStatus) => {
		setIsStatusUpdating(true);
		try {
			const response = await fetch(`/api/admin/college-students/${teamId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ registrationStatus: status }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update status");
			}

			setTeams((prev) =>
				prev.map((team) =>
					team._id === teamId ? { ...team, registrationStatus: status } : team
				)
			);

			if (selectedTeam?._id === teamId) {
				setSelectedTeam({ ...selectedTeam, registrationStatus: status });
			}

			alert(`Team marked as ${status}.`);
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setIsStatusUpdating(false);
		}
	};

	const handleSlotRoomUpdate = async (teamId: string) => {
		const values = editingSlotRoom[teamId];
		if (!values) return;

		const trimmedSlotId = (values.slotId ?? "").trim();
		const duplicateOwner = findDuplicateSlotOwner(teamId, trimmedSlotId);
		if (duplicateOwner) {
			setSlotValidationErrors((prev) => ({
				...prev,
				[teamId]: `Slot ID already assigned to ${duplicateOwner.teamName}.`,
			}));
			return;
		}

		setSlotValidationErrors((prev) => {
			if (!prev[teamId]) return prev;
			const next = { ...prev };
			delete next[teamId];
			return next;
		});

		setSavingSlotRoom(teamId);
		try {
			const response = await fetch(`/api/admin/college-students/${teamId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					slotId: trimmedSlotId || null,
					roomNo: (values.roomNo ?? "").trim() || null,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update slot/room");
			}

			setTeams((prev) =>
				prev.map((team) =>
					team._id === teamId 
						? {
								...team,
								slotId: trimmedSlotId || undefined,
								roomNo: (values.roomNo ?? "").trim() || undefined,
						  }
						: team
				)
			);

			// Clear editing state for this team
			setEditingSlotRoom((prev) => {
				const next = { ...prev };
				delete next[teamId];
				return next;
			});
			setSlotValidationErrors((prev) => {
				if (!prev[teamId]) return prev;
				const next = { ...prev };
				delete next[teamId];
				return next;
			});

			// Refresh the teams list to ensure we have latest data
			await fetchTeams();
			
			alert("Slot ID and Room No updated successfully!");
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setSavingSlotRoom(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
					<p className="text-white/70 mt-4 text-sm">Loading teams...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl">
				Error: {error}
			</div>
		);
	}

	return (
		<div className="space-y-6">
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === "" ? "" : "")}>
				<p className="text-sm text-white/70">Total Teams</p>
				<p className="text-4xl font-bold text-white mt-2 drop-shadow-lg">{teams.length}</p>
			</div>
			<div className={`bg-white/10 backdrop-blur-md border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${selectedStatus === "pending" ? "border-yellow-400/50 shadow-yellow-500/20" : "border-white/20 hover:shadow-yellow-500/20"}`} onClick={() => setSelectedStatus(selectedStatus === "pending" ? "" : "pending")}>
				<p className="text-sm text-white/70">Pending Review</p>
				<p className="text-4xl font-bold text-yellow-400 mt-2 drop-shadow-lg">
					{statusCounts.pending}
				</p>
			</div>
			<div className={`bg-white/10 backdrop-blur-md border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${selectedStatus === "approved" ? "border-green-400/50 shadow-green-500/20" : "border-white/20 hover:shadow-green-500/20"}`} onClick={() => setSelectedStatus(selectedStatus === "approved" ? "" : "approved")}>
				<p className="text-sm text-white/70">Approved</p>
				<p className="text-4xl font-bold text-green-400 mt-2 drop-shadow-lg">
					{statusCounts.approved}
				</p>
			</div>
			<div className={`bg-white/10 backdrop-blur-md border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${selectedStatus === "rejected" ? "border-red-400/50 shadow-red-500/20" : "border-white/20 hover:shadow-red-500/20"}`} onClick={() => setSelectedStatus(selectedStatus === "rejected" ? "" : "rejected")}>
				<p className="text-sm text-white/70">Rejected</p>
				<p className="text-4xl font-bold text-red-400 mt-2 drop-shadow-lg">
					{statusCounts.rejected}
				</p>
			</div>
		</div>			<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
					<input
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search teams or members..."
						className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder:text-white/50 transition-all text-sm"
					/>
					<select
						value={selectedSegment}
						onChange={(e) => setSelectedSegment(e.target.value)}
						className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm appearance-none cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
					>
						<option value="">All Segments</option>
						{uniqueSegments.map((segment) => (
							<option key={segment} value={segment}>
								{segment}
							</option>
						))}
					</select>
					<select
						value={selectedYear}
						onChange={(e) => setSelectedYear(e.target.value)}
						className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm appearance-none cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
					>
						<option value="">All Years</option>
						{uniqueYears.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
					<select
						value={selectedDepartment}
						onChange={(e) => setSelectedDepartment(e.target.value)}
						className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm appearance-none cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
					>
						<option value="">All Departments</option>
						{uniqueDepartments.map((dept) => (
							<option key={dept} value={dept}>
								{dept}
							</option>
						))}
					</select>
				</div>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={fetchTeams}
						className="px-4 py-2.5 rounded-xl bg-cyan-500/20 backdrop-blur-sm text-white border border-cyan-400/50 text-sm hover:bg-cyan-500 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
						disabled={isLoading}
					>
						Refresh
					</button>
					<button
						onClick={handleExport}
						disabled={isExporting}
						className="px-4 py-2.5 rounded-xl bg-green-500/20 backdrop-blur-sm text-white border border-green-400/50 text-sm hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
					>
						{isExporting ? "Exporting..." : "Download Excel"}
					</button>
					{(selectedSegment || selectedYear || selectedDepartment || searchQuery || selectedStatus) && (
						<button
							onClick={() => {
								setSearchQuery("");
								setSelectedSegment("");
								setSelectedYear("");
								setSelectedDepartment("");
								setSelectedStatus("");
							}}
							className="px-4 py-2.5 rounded-xl bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 text-sm hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
						>
							Clear Filters
						</button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredTeams.length === 0 ? (
					<div className="col-span-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-center text-white/70 shadow-xl">
						{searchQuery
							? "No teams match your search criteria."
							: "No college teams have registered yet."}
					</div>
				) : (
					filteredTeams.map((team) => (
						<div
							key={team._id}
							className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col"
						>
							{/* Card Header */}
							<div className="p-5 border-b border-white/10 bg-linear-to-br from-white/5 to-white/10">
								<div className="flex items-start justify-between gap-3 mb-3">
									<h3 className="text-white font-semibold text-lg leading-tight flex-1">
										{team.teamName}
									</h3>
									<span
										className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
											STATUS_STYLES[team.registrationStatus ?? "pending"]
										}`}
									>
										{team.registrationStatus ?? "pending"}
									</span>
								</div>
								<p className="text-white/70 text-sm line-clamp-3">
									{team.projectSummary || "No summary provided."}
								</p>
							</div>

							{/* Card Body */}
							<div className="p-5 flex-1 space-y-4">
								{/* Segments */}
								<div>
									<p className="text-xs text-white/60 mb-2 font-medium">SEGMENTS</p>
									<div className="flex flex-wrap gap-1.5">
										{team.segments.map((segment) => (
											<span
												key={segment}
												className="px-2.5 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
											>
												{segment}
											</span>
										))}
									</div>
								</div>

								{/* Slot & Room */}
								<div className="grid grid-cols-2 gap-3">
									<div>
										<p className="text-xs text-white/60 mb-1.5 font-medium">SLOT ID</p>
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-1">
												<input
													type="text"
													value={editingSlotRoom[team._id]?.slotId !== undefined ? editingSlotRoom[team._id].slotId : (team.slotId ?? "")}
													onChange={(e) => {
														const nextValue = e.target.value;
														setEditingSlotRoom((prev) => ({
															...prev,
															[team._id]: {
																slotId: nextValue,
																roomNo:
																	prev[team._id]?.roomNo !== undefined
																		? prev[team._id].roomNo
																	: (team.roomNo ?? ""),
															},
														}));
														setSlotValidationErrors((prevErrors) => {
															const duplicateOwner = findDuplicateSlotOwner(team._id, nextValue);
															if (duplicateOwner) {
																return {
																	...prevErrors,
																	[team._id]: `Already assigned to ${duplicateOwner.teamName}.`,
																};
															}
															if (!prevErrors[team._id]) {
																return prevErrors;
															}
															const nextErrors = { ...prevErrors };
															delete nextErrors[team._id];
															return nextErrors;
														});
													}}
														placeholder="e.g. S001"
														className={`w-full px-2.5 py-1.5 text-sm bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/40 focus:outline-none transition-all ${
															slotValidationErrors[team._id]
																? "border-red-400/50 focus:border-red-400"
																: "border-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/50"
														}`}
														maxLength={10}
													/>
													{editingSlotRoom[team._id] && (
														<button
															onClick={() => handleSlotRoomUpdate(team._id)}
															disabled={savingSlotRoom === team._id || Boolean(slotValidationErrors[team._id])}
															className="px-2.5 py-1.5 text-sm bg-green-500/20 backdrop-blur-sm text-white border border-green-400/50 rounded-lg hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 transition-all duration-300"
														>
														{savingSlotRoom === team._id ? "..." : "✓"}
													</button>
												)}
											</div>
											{slotValidationErrors[team._id] && (
												<p className="text-xs text-red-400">
													{slotValidationErrors[team._id]}
												</p>
											)}
										</div>
									</div>
									<div>
										<p className="text-xs text-white/60 mb-1.5 font-medium">ROOM NO</p>
										<input
											type="text"
											value={editingSlotRoom[team._id]?.roomNo !== undefined ? editingSlotRoom[team._id].roomNo : (team.roomNo ?? "")}
											onChange={(e) => setEditingSlotRoom(prev => ({
												...prev,
												[team._id]: {
													slotId: prev[team._id]?.slotId !== undefined ? prev[team._id].slotId : (team.slotId ?? ""),
													roomNo: e.target.value
												}
											}))}
											placeholder="e.g. R101"
											className="w-full px-2.5 py-1.5 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/50 transition-all"
											maxLength={10}
										/>
									</div>
								</div>

								{/* Team Members */}
								<div>
									<p className="text-xs text-white/60 mb-2 font-medium">TEAM MEMBERS ({team.teamMembers.length})</p>
									<div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
										{team.teamMembers.map((m, idx) => (
											<div key={m.email + idx} className="flex items-start gap-2 text-xs bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-1.5 mb-0.5">
														<span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
															idx === 0 ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30' : 'bg-white/10 text-white/70 border border-white/20'
														}`}>
															{idx === 0 ? "LEADER" : `M${idx}`}
														</span>
														<span className="text-white font-medium truncate">{m.fullName}</span>
													</div>
													<p className="text-white/60 truncate">{m.email}</p>
													{m.linkedinProfile && (
														<a
															href={m.linkedinProfile}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-400 hover:text-blue-300 underline mt-0.5 inline-block"
														>
															LinkedIn →
														</a>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Card Footer - Actions */}
							<div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
								<div className="grid grid-cols-2 gap-2">
									<button
										onClick={() => setSelectedTeam(team)}
										className="px-3 py-2 bg-blue-500/20 backdrop-blur-sm text-white border border-blue-400/50 text-sm rounded-xl hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-medium"
									>
										View Details
									</button>
									<button
										onClick={() => handleDelete(team._id)}
										disabled={isDeleting && deletingId === team._id}
										className="px-3 py-2 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 text-sm rounded-xl hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 font-medium"
									>
										{isDeleting && deletingId === team._id ? "..." : "Delete"}
									</button>
									<button
										onClick={() => handleStatusUpdate(team._id, "approved")}
										disabled={isStatusUpdating}
										className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
									>
										Approve
									</button>
									<button
										onClick={() => handleStatusUpdate(team._id, "rejected")}
										disabled={isStatusUpdating}
										className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 font-medium"
									>
										Reject
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>

		{selectedTeam && (
			<div 
				className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
				onClick={() => setSelectedTeam(null)}
			>
				<div 
					className="bg-white/10 backdrop-blur-xl border-t sm:border border-white/20 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-5xl shadow-2xl overflow-hidden relative max-h-[95vh] sm:max-h-[90vh] flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="shrink-0 sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/20 px-4 sm:px-6 py-4 z-10">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<h2 className="text-xl sm:text-2xl font-bold text-white truncate">
									{selectedTeam.teamName}
								</h2>
								<div className="flex items-center gap-2 mt-1 flex-wrap">
									<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
										STATUS_STYLES[selectedTeam.registrationStatus ?? "pending"]
									}`}>
										{selectedTeam.registrationStatus ?? "pending"}
									</span>
									<span className="text-xs text-gray-400">
										{selectedTeam.submittedAt
											? new Date(selectedTeam.submittedAt).toLocaleDateString()
											: selectedTeam.createdAt
											? new Date(selectedTeam.createdAt).toLocaleDateString()
											: "Unknown"}
									</span>
								</div>
							</div>
							<button
								onClick={() => setSelectedTeam(null)}
								className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition-all"
								aria-label="Close"
							>
								×
							</button>
						</div>
					</div>

					{/* Scrollable Content */}
					<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
						{/* Project Overview */}
						<section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
							<h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
								<span className="text-2xl">📋</span>
								Project Overview
							</h3>
							<p className="text-sm sm:text-base text-white/80 leading-relaxed mb-4">
								{selectedTeam.projectSummary || "No project summary provided."}
							</p>
							<div className="flex flex-wrap gap-2">
								{selectedTeam.segments.map((segment) => (
									<span
										key={segment}
										className="px-3 py-1.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
									>
										{segment}
									</span>
								))}
							</div>
						</section>

						{/* Team Members */}
						<section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
									<span className="text-2xl">👥</span>
									Team Members
								</h3>
								<span className="text-xs sm:text-sm px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full font-medium">
									{selectedTeam.teamMembers.length} members
								</span>
							</div>
							<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
								{selectedTeam.teamMembers.map((member, index) => (
									<div
										key={`${member.email}-${index}`}
										className="border border-white/10 rounded-xl p-4 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10 transition-all"
									>
										<div className="flex items-start justify-between mb-3 gap-2">
											<p className="text-white font-semibold text-sm sm:text-base flex-1 min-w-0">
												{member.fullName}
											</p>
											<span className={`shrink-0 text-xs px-2 py-1 rounded-full ${
												index === 0 
													? "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30" 
													: "bg-blue-500/20 text-blue-200 border border-blue-400/30"
											}`}>
												{index === 0 ? "👑 Leader" : `#${index + 1}`}
											</span>
										</div>
										<div className="space-y-2 text-xs sm:text-sm text-white/80">
											<div className="flex items-center gap-2">
												<span className="text-white/50 w-20 shrink-0">Dept:</span>
												<span className="font-medium">{member.department}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-white/50 w-20 shrink-0">Year:</span>
												<span className="text-white truncate">{member.yearOfStudy}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-white/50 w-20 shrink-0">Roll:</span>
												<span className="text-white truncate">{member.rollNumber}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-white/50 w-20 shrink-0">Email:</span>
												<a href={`mailto:${member.email}`} className="text-blue-400 hover:text-blue-300 break-all font-medium">
													{member.email}
												</a>
											</div>
										<div className="flex items-center gap-2">
											<span className="text-white/50 w-20 shrink-0">Phone:</span>
											<a href={`tel:${member.contactNumber}`} className="text-blue-400 hover:text-blue-300 font-medium">
												{member.contactNumber}
											</a>
										</div>
										{member.linkedinProfile && (
											<div className="flex items-start gap-2 pt-2 border-t border-white/10">
												<span className="text-white/50 w-20 shrink-0">LinkedIn:</span>
													<a
														href={member.linkedinProfile}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-400 hover:text-blue-300 underline break-all text-xs"
													>
														View Profile
													</a>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</section>

					{/* Action Buttons */}
					<section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
						<h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<span className="text-2xl">⚡</span>
							Actions
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<button
								onClick={() => handleStatusUpdate(selectedTeam._id, "approved")}
								disabled={isStatusUpdating}
								className="px-4 py-3 bg-green-500/20 backdrop-blur-sm text-white border border-green-400/50 rounded-xl hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 font-medium text-sm sm:text-base"
							>
								✅ Approve
							</button>
							<button
								onClick={() => handleStatusUpdate(selectedTeam._id, "rejected")}
								disabled={isStatusUpdating}
								className="px-4 py-3 bg-yellow-500/20 backdrop-blur-sm text-white border border-yellow-400/50 rounded-xl hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 disabled:opacity-50 font-medium text-sm sm:text-base"
							>
								⚠️ Reject
							</button>
							<button
								onClick={() => handleDelete(selectedTeam._id)}
								disabled={isDeleting}
								className="px-4 py-3 bg-red-500/20 backdrop-blur-sm text-white border border-red-400/50 rounded-xl hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 font-medium text-sm sm:text-base"
							>
								🗑️ Delete
							</button>
						</div>
					</section>

					{/* Reviews Section */}
					<section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
								<span className="text-2xl">⭐</span>
								Project Reviews
							</h3>
							<span className="text-xs sm:text-sm px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full font-medium border border-purple-400/30">
								{projectReviews.length} reviews
							</span>
						</div>

						{loadingReviews ? (
							<div className="text-center py-12 text-white/70">
								<div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3"></div>
								Loading reviews...
							</div>
						) : projectReviews.length === 0 ? (
							<div className="text-center py-12 text-white/70">
								<div className="text-4xl mb-3">📝</div>
								<p className="text-sm">No reviews yet for this project.</p>
							</div>
						) : (
							<div className="space-y-3">
								{projectReviews.map((review) => (
									<div
										key={review._id}
										className={`border rounded-2xl p-4 ${
											review.hidden 
												? "border-red-400/50 bg-red-500/10 backdrop-blur-sm" 
												: "border-white/10 bg-white/5 backdrop-blur-sm"
										}`}
									>
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
											<div className="flex-1 min-w-0">
												<StarRating rating={review.rating} size="sm" />
												<p className="mt-2 text-white font-semibold text-sm sm:text-base">{review.reviewerName}</p>
												<p className="text-xs text-white/60 truncate">{review.reviewerEmail}</p>
												<p className="text-xs text-white/50 mt-1">
													{new Date(review.createdAt).toLocaleDateString()} 
													{review.createdAt !== review.updatedAt && " (edited)"}
												</p>
												{review.hidden && (
													<span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-red-500/30 text-red-200 border border-red-500/50">
														🔒 Hidden from public
													</span>
												)}
											</div>
											<div className="flex gap-2 shrink-0">
												<button
													onClick={() => handleToggleReviewVisibility(review._id, review.hidden)}
													disabled={togglingReview === review._id}
													className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition font-medium ${
														review.hidden
															? "bg-green-500/20 text-green-200 hover:bg-green-500/30 border border-green-500/30"
															: "bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30 border border-yellow-500/30"
													} disabled:opacity-50`}
												>
													{togglingReview === review._id 
														? "..." 
														: review.hidden ? "👁️ Show" : "🙈 Hide"
													}
												</button>
												<button
													onClick={() => handleDeleteReview(review._id)}
													className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition border border-red-500/30 font-medium"
												>
													🗑️
												</button>
											</div>
										</div>
										<p className="text-sm text-gray-300 leading-relaxed mt-3 border-t border-zinc-700/50 pt-3">
											{review.comment}
										</p>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
		)}
		</div>
	);
}