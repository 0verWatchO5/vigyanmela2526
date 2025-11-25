"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StarRating from "../reviews/StarRating";

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
		if (!query) return teams;

		return teams.filter((team) => {
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

			return matchesTeamName || matchesSummary || matchesSegments || matchesMember;
		});
	}, [teams, searchQuery]);

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
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
				Error: {error}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
					<p className="text-sm text-gray-400">Total Teams</p>
					<p className="text-3xl font-semibold text-white mt-2">{teams.length}</p>
				</div>
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
					<p className="text-sm text-gray-400">Pending Review</p>
					<p className="text-3xl font-semibold text-yellow-300 mt-2">
						{statusCounts.pending}
					</p>
				</div>
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
					<p className="text-sm text-gray-400">Approved</p>
					<p className="text-3xl font-semibold text-green-300 mt-2">
						{statusCounts.approved}
					</p>
				</div>
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
					<p className="text-sm text-gray-400">Rejected</p>
					<p className="text-3xl font-semibold text-red-300 mt-2">
						{statusCounts.rejected}
					</p>
				</div>
			</div>

			<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
				<input
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					placeholder="Search by team name, segment, or member details"
					className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-cyan-500 focus:outline-none"
				/>
				<div className="mt-4 flex flex-wrap gap-3">
					<button
						onClick={fetchTeams}
						className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-500 transition"
						disabled={isLoading}
					>
						Refresh
					</button>
					<button
						onClick={handleExport}
						disabled={isExporting}
						className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500 transition disabled:opacity-50"
					>
						{isExporting ? "Exporting..." : "Download Excel"}
					</button>
				</div>
			</div>

			<div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left">
						<thead className="bg-zinc-800 uppercase text-xs text-gray-400">
							<tr>
								<th className="px-6 py-3">Team / Summary</th>
								<th className="px-6 py-3">Segments</th>
								<th className="px-6 py-3">Slot ID</th>
								<th className="px-6 py-3">Room No</th>
								<th className="px-6 py-3">Members (Details)</th>
								<th className="px-6 py-3">Status</th>
								<th className="px-6 py-3">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800">
							{filteredTeams.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-10 text-center text-gray-400">
										{searchQuery
											? "No teams match your search criteria."
											: "No college teams have registered yet."}
									</td>
								</tr>
							) : (
								filteredTeams.map((team) => (
									<tr key={team._id} className="hover:bg-zinc-800/40 transition">
										<td className="px-6 py-4">
											<div className="space-y-1">
												<p className="text-white font-medium">{team.teamName}</p>
												<p className="text-gray-400 text-xs whitespace-pre-wrap">
													{team.projectSummary || "No summary provided."}
												</p>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-1">
												{team.segments.map((segment) => (
													<span
														key={segment}
														className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-200"
													>
														{segment}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-4">
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
																		[team._id]: `Slot ID already assigned to ${duplicateOwner.teamName}.`,
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
														className={`w-24 px-2 py-1 text-sm bg-zinc-800 border rounded text-white placeholder-gray-500 focus:outline-none ${
															slotValidationErrors[team._id]
																? "border-red-500 focus:border-red-400"
																: "border-zinc-700 focus:border-cyan-500"
														}`}
														maxLength={10}
													/>
													{editingSlotRoom[team._id] && (
														<button
															onClick={() => handleSlotRoomUpdate(team._id)}
															disabled={savingSlotRoom === team._id || Boolean(slotValidationErrors[team._id])}
															className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
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
										</td>
										<td className="px-6 py-4">
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
												className="w-24 px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
												maxLength={10}
											/>
										</td>
										<td className="px-6 py-4 text-gray-200">
											<div className="flex flex-col gap-1">
												{team.teamMembers.map((m, idx) => (
													<div key={m.email + idx} className="text-xs">
														<span className="text-cyan-300 font-medium">{idx === 0 ? "Leader" : `Member ${idx + 1}`}:</span>{" "}
														<span className="text-white">{m.fullName}</span>{" "}
														<span className="text-gray-400">({m.email})</span>
														{m.linkedinProfile ? (
															<>
																{" "}
																<a
																	href={m.linkedinProfile}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-blue-300 underline"
																	title="Open LinkedIn profile"
																>
																	LinkedIn
																</a>
															</>
														) : null}
													</div>
												))}
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-3 py-1 text-xs font-medium rounded-full ${
													STATUS_STYLES[team.registrationStatus ?? "pending"]
												}`}
											>
												{team.registrationStatus ?? "pending"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-2">
												<button
													onClick={() => setSelectedTeam(team)}
													className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
												>
													View
												</button>
												<button
													onClick={() => handleStatusUpdate(team._id, "approved")}
													disabled={isStatusUpdating}
													className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
												>
													Approve
												</button>
												<button
													onClick={() => handleStatusUpdate(team._id, "rejected")}
													disabled={isStatusUpdating}
													className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
												>
													Reject
												</button>
												<button
													onClick={() => handleDelete(team._id)}
													disabled={isDeleting && deletingId === team._id}
													className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
												>
													{isDeleting && deletingId === team._id ? "..." : "Delete"}
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{selectedTeam && (
				<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-10 overflow-y-auto">
					<div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
						<div className="flex items-start justify-between px-6 py-4 border-b border-zinc-800">
							<div>
								<h2 className="text-2xl font-semibold text-white">
									{selectedTeam.teamName}
								</h2>
								<p className="text-sm text-gray-400">
									Submitted on {" "}
									{selectedTeam.submittedAt
										? new Date(selectedTeam.submittedAt).toLocaleString()
										: selectedTeam.createdAt
										? new Date(selectedTeam.createdAt).toLocaleString()
										: "Unknown"}
								</p>
							</div>
							<button
								onClick={() => setSelectedTeam(null)}
								className="text-gray-400 hover:text-white text-2xl"
							>
								×
							</button>
						</div>

						<div className="px-6 py-6 space-y-6">
							<section className="space-y-3">
								<h3 className="text-lg font-semibold text-white">Project Overview</h3>
								<p className="text-sm text-gray-300 leading-relaxed">
									{selectedTeam.projectSummary || "No project summary provided."}
								</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeam.segments.map((segment) => (
										<span
											key={segment}
											className="px-3 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-200"
										>
											{segment}
										</span>
									))}
								</div>
							</section>

							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-white">Team Members</h3>
									<span className="text-sm text-gray-400">
										{selectedTeam.teamMembers.length} participant(s)
									</span>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									{selectedTeam.teamMembers.map((member, index) => (
										<div
											key={`${member.email}-${index}`}
											className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/70"
										>
											<div className="flex items-center justify-between mb-2">
												<p className="text-white font-medium">
													{member.fullName}
												</p>
												<span className="text-xs text-cyan-200">
													{index === 0 ? "Team Leader" : `Member ${index + 1}`}
												</span>
											</div>
											<ul className="text-xs text-gray-300 space-y-1">
												<li>Department: {member.department}</li>
												<li>Year: {member.yearOfStudy}</li>
												<li>Email: {member.email}</li>
												<li>Contact: {member.contactNumber}</li>
												<li>Roll: {member.rollNumber}</li>
												{member.linkedinProfile ? (
													<li>
														LinkedIn: {" "}
														<a
															href={member.linkedinProfile}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-300 underline"
														>
															{member.linkedinProfile}
														</a>
													</li>
												) : null}
											</ul>
										</div>
									))}
								</div>
							</section>

							<section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-400">Status:</span>
									<span
										className={`px-3 py-1 text-xs font-medium rounded-full ${
											STATUS_STYLES[selectedTeam.registrationStatus ?? "pending"]
										}`}
									>
										{selectedTeam.registrationStatus ?? "pending"}
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => handleStatusUpdate(selectedTeam._id, "approved")}
										disabled={isStatusUpdating}
										className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
									>
										Approve
									</button>
									<button
										onClick={() => handleStatusUpdate(selectedTeam._id, "rejected")}
										disabled={isStatusUpdating}
										className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
									>
										Reject
									</button>
									<button
										onClick={() => handleDelete(selectedTeam._id)}
										disabled={isDeleting}
										className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
									>
										Delete
									</button>
								</div>
							</section>

							{/* Reviews Section */}
							<section className="space-y-4 border-t border-zinc-800 pt-6">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-white">Project Reviews</h3>
									<span className="text-sm text-gray-400">
										{projectReviews.length} review(s)
									</span>
								</div>

								{loadingReviews ? (
									<div className="text-center py-8 text-gray-400">
										Loading reviews...
									</div>
								) : projectReviews.length === 0 ? (
									<div className="text-center py-8 text-gray-400">
										No reviews yet for this project.
									</div>
								) : (
									<div className="space-y-3">
										{projectReviews.map((review) => (
											<div
												key={review._id}
												className={`border rounded-xl p-4 ${
													review.hidden 
														? "border-red-800 bg-red-900/20" 
														: "border-zinc-800 bg-zinc-900/70"
												}`}
											>
												<div className="flex items-start justify-between mb-3">
													<div>
														<StarRating rating={review.rating} size="sm" />
														<p className="mt-1 text-white font-medium">{review.reviewerName}</p>
														<p className="text-xs text-gray-400">{review.reviewerEmail}</p>
														<p className="text-xs text-gray-500 mt-1">
															{new Date(review.createdAt).toLocaleDateString()} 
															{review.createdAt !== review.updatedAt && " (edited)"}
														</p>
														{review.hidden && (
															<span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-red-500/20 text-red-200">
																Hidden from public
															</span>
														)}
													</div>
													<div className="flex gap-2">
														<button
															onClick={() => handleToggleReviewVisibility(review._id, review.hidden)}
															disabled={togglingReview === review._id}
															className={`px-3 py-1 text-xs rounded transition ${
																review.hidden
																	? "bg-green-500/20 text-green-200 hover:bg-green-500/30"
																	: "bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30"
															} disabled:opacity-50`}
														>
															{togglingReview === review._id 
																? "..." 
																: review.hidden ? "Show" : "Hide"
															}
														</button>
														<button
															onClick={() => handleDeleteReview(review._id)}
															className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-200 hover:bg-red-500/30 transition"
														>
															Delete
														</button>
													</div>
												</div>
												<p className="text-sm text-gray-300 leading-relaxed">
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

