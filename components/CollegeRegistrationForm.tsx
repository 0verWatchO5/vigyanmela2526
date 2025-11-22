"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/form-inputs";
import {
	BottomGradient,
	Label,
	LabelInputContainer,
} from "@/components/ui/form-components";

const SEGMENT_OPTIONS = [
	"Technology & Innovation",
	"Environment & Sustainability",
	"Health & Education",
	"Social Good",
	"Creative Science",
];

const DEPARTMENT_OPTIONS = [
	"BSc. IT",
	"BMS",
	"BAF",
	"BBA",
	"BFM",
	"BMM",
];

const YEAR_OF_STUDY_OPTIONS = [
	"First Year",
	"Second Year",
	"Third Year",
];

const TEAM_SIZE_OPTIONS = [2, 3, 4] as const;
type TeamSizeOption = (typeof TEAM_SIZE_OPTIONS)[number];

interface TeamMember {
	fullName: string;
	department: string;
	email: string;
	contactNumber: string;
	rollNumber: string;
	yearOfStudy: string;
    linkedinProfile?: string;
}

interface SubmissionRecord {
	id: string;
	teamName: string;
	projectSummary: string;
	projectImage?: string;
	teamSize: number;
	segments: string[];
	teamMembers: TeamMember[];
	registrationStatus?: string;
	submittedAt?: string;
	updatedAt?: string;
}

const createEmptyMember = (): TeamMember => ({
	fullName: "",
	department: "",
	email: "",
	contactNumber: "",
	rollNumber: "",
	yearOfStudy: "",
    linkedinProfile: "",
});

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-yellow-500/20 text-yellow-200",
	approved: "bg-green-500/20 text-green-200",
	rejected: "bg-red-500/20 text-red-200",
};

export default function CollegeRegistrationForm() {
	const { data: session, status: sessionStatus } = useSession();

	const [teamName, setTeamName] = useState("");
	const [projectSummary, setProjectSummary] = useState("");
	const [projectImage, setProjectImage] = useState<string>("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [teamSize, setTeamSize] = useState<TeamSizeOption>(TEAM_SIZE_OPTIONS[0]);
	const [segments, setSegments] = useState<string[]>([]);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
		Array.from({ length: TEAM_SIZE_OPTIONS[0] }, createEmptyMember)
	);
	const [existingData, setExistingData] = useState<SubmissionRecord | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isFetchingExisting, setIsFetchingExisting] = useState(false);
	const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [shareLoading, setShareLoading] = useState(false);

	useEffect(() => {
		setTeamMembers((prev) => {
			if (prev.length === teamSize) return prev;
			if (prev.length < teamSize) {
				return [
					...prev,
					...Array.from({ length: teamSize - prev.length }, createEmptyMember),
				];
			}
			return prev.slice(0, teamSize);
		});
	}, [teamSize]);

	useEffect(() => {
		const linkedUser = session?.user;
		if (!linkedUser) return;

		setTeamMembers((prev) => {
			if (!prev.length) return prev;
			const next = [...prev];
			const leader = { ...next[0] };

			if (linkedUser.name && !leader.fullName) {
				leader.fullName = linkedUser.name;
			}
			if (linkedUser.email && !leader.email) {
				leader.email = linkedUser.email;
			}
			// Prefill leader's LinkedIn profile URL if available on session
			const possibleLinkedIn = (linkedUser as any)?.profileUrl || (linkedUser as any)?.linkedin || (linkedUser as any)?.url;
			if (possibleLinkedIn && !leader.linkedinProfile) {
				leader.linkedinProfile = String(possibleLinkedIn);
			}

			next[0] = leader;
			return next;
		});
	}, [session]);

	const memberLabels = useMemo(
		() =>
			teamMembers.map((_, index) =>
				index === 0 ? "Team Leader" : `Member ${index + 1}`
			),
		[teamMembers]
	);

	const handleSegmentToggle = (segment: string) => {
		setSegments((prev) =>
			prev.includes(segment)
				? prev.filter((item) => item !== segment)
				: [...prev, segment]
		);
	};

	const updateTeamMember = (
		index: number,
		field: keyof TeamMember,
		value: string
	) => {
		setTeamMembers((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	};

	const isFormValid = useMemo(() => {
		const baseValid =
			teamName.trim().length > 0 &&
			projectSummary.trim().length > 0 &&
			segments.length > 0;

		if (!baseValid) return false;

		return teamMembers.every((member) => {
			const hasRequiredFields =
				member.fullName.trim().length > 0 &&
				member.department.trim().length > 0 &&
				member.email.trim().length > 0 &&
				member.contactNumber.trim().length === 10 &&
				member.rollNumber.trim().length > 0 &&
				member.yearOfStudy.trim().length > 0 &&
				(member.linkedinProfile || "").trim().length > 0;

			const emailValid = /^\S+@\S+\.\S+$/.test(member.email.trim());
			const contactValid = /^[0-9]{10}$/.test(member.contactNumber.trim());
			const linkedinValid = /^https:\/\/(www\.)?linkedin\.com\//i.test((member.linkedinProfile || "").trim());

			return hasRequiredFields && emailValid && contactValid && linkedinValid;
		});
	}, [teamMembers, teamName, projectSummary, segments]);

	const populateFormFromSubmission = useCallback((submission: SubmissionRecord) => {
		setTeamName(submission.teamName);
		setProjectSummary(submission.projectSummary);
		setProjectImage(submission.projectImage || "");
		setImagePreview(submission.projectImage || "");
		setTeamSize(submission.teamSize as TeamSizeOption);
		setSegments([...submission.segments]);
		setTeamMembers(submission.teamMembers.map((m) => ({ ...m })));
	}, []);

	const fetchExisting = useCallback(async (force = false) => {
		if (!session?.user?.id) return;
		if (!force && hasLoadedExisting) return;
		setIsFetchingExisting(true);
		try {
			const res = await fetch("/api/college-registration");
			const json = await res.json().catch(() => ({}));
			if (res.status === 401) {
				setExistingData(null);
				return;
			}
			if (!res.ok) {
				if (!existingData) {
					setErrorMessage(json.error || "Unable to load your registration.");
				}
				setExistingData(null);
				return;
			}
			const data = json.data as SubmissionRecord | null;
			if (data) {
				setExistingData(data);
				populateFormFromSubmission(data);
				setIsEditing(false);
				setErrorMessage(null);
			} else {
				setExistingData(null);
			}
		} catch (e) {
			if (!existingData) {
				setErrorMessage("Network error while loading registration.");
			}
		} finally {
			setIsFetchingExisting(false);
			setHasLoadedExisting(true);
		}
	}, [session?.user?.id, hasLoadedExisting, existingData, populateFormFromSubmission]);

	useEffect(() => {
		if (sessionStatus === "authenticated") {
			fetchExisting();
		}
	}, [sessionStatus, fetchExisting]);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
			setErrorMessage("Only JPEG, PNG, WebP, and GIF images are allowed");
			return;
		}

		// Validate file size (20MB)
		if (file.size > 20 * 1024 * 1024) {
			setErrorMessage("Image size must be less than 20MB");
			return;
		}

		setImageFile(file);
		
		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const uploadImage = async (): Promise<string | null> => {
		if (!imageFile) return projectImage || null;

		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append("file", imageFile);
			formData.append("title", `project-${teamName}-${Date.now()}`);

			const response = await fetch("/api/cloudinary", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Upload failed");
			}

			console.log('Image uploaded successfully:', data.data?.url);
			return data.data?.url || null;
		} catch (error) {
			console.error("Image upload error:", error);
			setErrorMessage("Failed to upload image. Please try again.");
			return null;
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null);
		setFeedbackMessage(null);
		if (!session?.user?.id) {
			setErrorMessage("Please sign in to submit or edit your registration.");
			return;
		}
		setLoading(true);
		try {
			// Upload image first if new image selected
			let imageUrl = projectImage || "";
			if (imageFile) {
				const uploadedUrl = await uploadImage();
				if (!uploadedUrl) {
					setLoading(false);
					setErrorMessage("Failed to upload image. Please try again.");
					return; // Stop if image upload failed
				}
				imageUrl = uploadedUrl;
				setProjectImage(uploadedUrl); // Save to state
			}

			const method: "POST" | "PATCH" = existingData ? "PATCH" : "POST";
			console.log('Submitting with image URL:', imageUrl);
			const res = await fetch("/api/college-registration", {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					teamName: teamName.trim(),
					projectSummary: projectSummary.trim(),
					projectImage: imageUrl,
					teamSize,
					segments,
					teamMembers: teamMembers.map((m) => ({
						fullName: m.fullName.trim(),
						department: m.department,
						email: m.email.trim(),
						contactNumber: m.contactNumber.trim(),
						rollNumber: m.rollNumber.trim(),
						yearOfStudy: m.yearOfStudy,
						linkedinProfile: (m.linkedinProfile || "").trim(),
					})),
				}),
			});
			const json = await res.json();
			if (!res.ok) {
				setErrorMessage(json.error || (existingData ? "Update failed." : "Submission failed."));
				return;
			}
			const saved = json.data as SubmissionRecord | null;
			if (saved) {
				setExistingData(saved);
				populateFormFromSubmission(saved);
			}
			setIsEditing(false);
			setImageFile(null);
			// Auto-share on LinkedIn for initial submissions if possible
			let baseMessage = existingData ? "Registration updated successfully." : "Registration submitted successfully";
			if (method === "POST") {
				if (!imageUrl) {
					baseMessage += ". Add a project image to enable LinkedIn sharing.";
				} else if (!session?.user?.id) {
					baseMessage += ". (Sign in again to share on LinkedIn.)";
				} else {
					try {
						const hashtags = ["VigyanMela", "Innovation", "Science", ...segments]
							.map((s) => `#${String(s).replace(/[^A-Za-z0-9]/g, "")}`)
							.filter(Boolean)
							.join(" ");

						const comment = `Excited to share our project \"${teamName.trim()}\" for Vigyan Mela 2025-26!\n\n${projectSummary.trim()}\n\n${hashtags}`.slice(0, 2500);

						const shareRes = await fetch("/api/linkedin/post", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								comment,
								title: teamName.trim(),
								description: projectSummary.trim(),
								imageUrl,
							}),
						});
						const shareJson = await shareRes.json().catch(() => ({}));
						if (shareRes.ok) {
							baseMessage += " and shared on LinkedIn.";
						} else {
							baseMessage += ` (LinkedIn share failed: ${shareJson?.error || "error"}).`;
						}
					} catch (shareErr) {
						baseMessage += " (LinkedIn share encountered an unexpected error.)";
					}
				}
			}
			setFeedbackMessage(baseMessage);
		} catch (err) {
			setErrorMessage("Unexpected error. Try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleStartEdit = () => {
		if (!existingData) return;
		populateFormFromSubmission(existingData);
		setIsEditing(true);
		setFeedbackMessage(null);
	};

	const handleCancelEdit = () => {
		if (existingData) {
			populateFormFromSubmission(existingData);
			setIsEditing(false);
		}
		setErrorMessage(null);
	};

	const handleRefresh = () => fetchExisting(true);

	const handleShareOnLinkedIn = async () => {
		setErrorMessage(null);
		setFeedbackMessage(null);
		if (!session?.user?.id) {
			setErrorMessage("Please sign in to share on LinkedIn.");
			return;
		}
		if (!existingData) {
			setErrorMessage("No submission found to share.");
			return;
		}
		if (!existingData.projectImage) {
			setErrorMessage("Please add a project image to enable LinkedIn sharing.");
			return;
		}

		setShareLoading(true);
		try {
			const hashtags = ["VigyanMela", "Innovation", "Science", ...existingData.segments]
				.map((s) => `#${String(s).replace(/[^A-Za-z0-9]/g, "")}`)
				.filter(Boolean)
				.join(" ");

			const comment = `Excited to share our project "${existingData.teamName}" for Vigyan Mela 2025-26!\n\n${existingData.projectSummary}\n\n${hashtags}`.slice(0, 2500);

			const res = await fetch("/api/linkedin/post", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					comment,
					title: existingData.teamName,
					description: existingData.projectSummary,
					imageUrl: existingData.projectImage,
				}),
			});

			const json = await res.json().catch(() => ({}));
			if (!res.ok) {
				setErrorMessage(json?.error || "Failed to share on LinkedIn.");
				return;
			}

			const postId: string | undefined = json?.data?.id;
			const postLink = postId && typeof postId === "string" && postId.startsWith("urn:li:ugcPost:")
				? `https://www.linkedin.com/feed/update/${postId}`
				: null;
			setFeedbackMessage(postLink ? "Shared on LinkedIn! View your post via your LinkedIn feed." : "Shared on LinkedIn successfully.");
		} catch (e) {
			setErrorMessage("Unexpected error while sharing. Please try again.");
		} finally {
			setShareLoading(false);
		}
	};

	const statusLabel = existingData?.registrationStatus ?? "pending";
	const statusClass = STATUS_STYLES[statusLabel] ?? STATUS_STYLES.pending;
	const submittedOn = existingData ? (existingData.updatedAt || existingData.submittedAt) : null;
	const initialLoad = sessionStatus === "loading" || (session?.user?.id && !hasLoadedExisting && isFetchingExisting);

	if (initialLoad) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
					<p className="text-sm">Loading your registration...</p>
				</div>
			</div>
		);
	}

	if (existingData && !isEditing) {
		return (
			<div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12 px-4">
				<div className="max-w-3xl mx-auto">
					<div className="bg-linear-to-br from-neutral-900 to-neutral-950 rounded-2xl p-8 shadow-2xl border border-neutral-800">
						<h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Your Registration</h1>
						<p className="text-sm text-neutral-400 mb-4">Signed in as {session?.user?.email || session?.user?.name || "LinkedIn User"}</p>
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${statusClass}`}>{statusLabel}</span>
							{submittedOn && <span className="text-xs text-neutral-500">Updated: {new Date(submittedOn).toLocaleString()}</span>}
							{isFetchingExisting && <span className="text-xs text-neutral-500">Refreshing...</span>}
						</div>
						{feedbackMessage && (
							<div className="mb-4 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">{feedbackMessage}</div>
						)}
						{errorMessage && (
							<div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>
						)}
						<div className="space-y-6">
							<div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
								<h2 className="text-lg font-semibold text-white mb-2">Team Overview</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-300">
									<div>
										<span className="text-neutral-500">Team / Project Name</span>
										<div className="font-medium text-white">{existingData.teamName}</div>
									</div>
									<div>
										<span className="text-neutral-500">Segments</span>
										<div className="font-medium text-white">{existingData.segments.join(", ")}</div>
									</div>
									<div>
										<span className="text-neutral-500">Team Size</span>
										<div className="font-medium text-white">{existingData.teamSize} members</div>
									</div>
								</div>

                <div className="mt-4 w-full max-w-full">
                  <span className="text-neutral-500 block text-sm mb-1">Project Summary</span>
                  <p className="text-sm text-neutral-200 leading-relaxed break-words">{existingData.projectSummary}</p>
                </div>

								{existingData.projectImage && (
									<div className="mt-4 w-full max-w-full">
										<span className="text-neutral-500 block text-sm mb-2">Project Image</span>
										<div className="relative h-64 w-full rounded-lg overflow-hidden border border-neutral-700">
											<img
												src={existingData.projectImage}
												alt={existingData.teamName}
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
								)}

							</div>
							<div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
								<h2 className="text-lg font-semibold text-white mb-2">Team Members</h2>
								<div className="space-y-3">
									{existingData.teamMembers.map((m, i) => (
										<div key={`${m.email}-${i}`} className="border border-neutral-800 rounded-lg p-3 bg-neutral-900/40">
											<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
												<span className="text-sm font-semibold text-cyan-300">{i === 0 ? "Team Leader" : `Member ${i + 1}`}</span>
												<span className="text-sm text-neutral-400">{m.department} • {m.yearOfStudy}</span>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-200">
												<div><span className="text-neutral-500">Name:</span> {m.fullName}</div>
												<div><span className="text-neutral-500">Email:</span> {m.email}</div>
												<div><span className="text-neutral-500">Contact:</span> {m.contactNumber}</div>
												<div><span className="text-neutral-500">Roll No.:</span> {m.rollNumber}</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="mt-8 flex flex-col sm:flex-row gap-3">
	                            {/* <button onClick={handleShareOnLinkedIn} disabled={shareLoading || isFetchingExisting || !existingData.projectImage} className="flex-1 px-4 py-2 bg-[#0a66c2] text-white rounded-md hover:opacity-90 transition disabled:opacity-60">
	                                {shareLoading ? "Sharing..." : "Share on LinkedIn"}
	                            </button> */}
							<button onClick={handleStartEdit} className="flex-1 px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:opacity-90 transition">Edit Submission</button>
							<button disabled={isFetchingExisting} onClick={() => handleRefresh()} className="flex-1 px-4 py-2 bg-transparent border border-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-800 transition disabled:opacity-60">Refresh</button>
							<a href="/" className="flex-1 px-4 py-2 text-center bg-transparent border border-neutral-700 text-neutral-200 rounded-md hover:bg-neutral-800 transition">Home</a>
						</div>
	                        {!existingData.projectImage && (
	                            <p className="mt-2 text-xs text-neutral-400">Add a project image to enable LinkedIn sharing.</p>
	                        )}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="bg-linear-to-br from-neutral-900 to-neutral-950 rounded-2xl p-8 shadow-2xl border border-neutral-800">
					<h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
						{existingData ? "Edit Your Registration" : "Register your Project to display at Vigyan Mela 2025"}
					</h1>
					<p className="text-neutral-400 mb-8">
						{existingData ? "Update your details and save changes." : "Share your team details to participate in Vigyan Mela 2025-26."}
					</p>

					{feedbackMessage && (
						<div className="mb-6 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">{feedbackMessage}</div>
					)}

					{errorMessage && (
						<div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
							{errorMessage}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-10">
						<section className="space-y-6">
							<h2 className="text-2xl font-semibold text-white">Team Overview</h2>
							<div className="grid gap-6 md:grid-cols-2">
								<LabelInputContainer>
									<Label htmlFor="team-name">Team Name / Project Name</Label>
									<Input
										id="team-name"
										value={teamName}
										onChange={(event) => setTeamName(event.target.value)}
										placeholder="Innovators United"
										required
									/>
								</LabelInputContainer>
								<LabelInputContainer>
									<Label htmlFor="team-size">
										Number of Team Members (including leader)
									</Label>
									<select
										id="team-size"
										value={teamSize}
										onChange={(event) =>
											setTeamSize(
												Number(event.target.value) as TeamSizeOption
											)
										}
										className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
										required
									>
										{TEAM_SIZE_OPTIONS.map((size) => (
											<option key={size} value={size}>
												{size} members
											</option>
										))}
									</select>
								</LabelInputContainer>
							</div>

							<LabelInputContainer>
								<Label htmlFor="project-summary">
									Short Description About Your Project / Product
								</Label>
								<textarea
									id="project-summary"
									value={projectSummary}
									onChange={(event) => setProjectSummary(event.target.value)}
									className="flex min-h-[120px] w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-600"
									placeholder="Explain the problem you solve and the impact you aim to create."
									required
								/>
							</LabelInputContainer>

							<LabelInputContainer>
								<Label htmlFor="project-image">
									Project Image (Optional)
								</Label>
								<input
									id="project-image"
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-neutral-600"
								/>
								{imagePreview && (
									<div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-neutral-700">
										<img
											src={imagePreview}
											alt="Project preview"
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={() => {
												setImageFile(null);
												setImagePreview("");
												setProjectImage("");
											}}
											className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								)}
								<p className="text-xs text-neutral-500 mt-1">
									Accepted formats: JPEG, PNG, WebP, GIF (Max 20MB)
								</p>
							</LabelInputContainer>

							<div>
								<p className="mb-2 block text-sm text-neutral-200">
									Which segments does your project align with?
								</p>
								<div className="grid sm:grid-cols-2 gap-2">
									{SEGMENT_OPTIONS.map((segment) => (
										<label
											key={segment}
											className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 hover:border-cyan-500/50 transition"
										>
											<input
												type="checkbox"
												checked={segments.includes(segment)}
												onChange={() => handleSegmentToggle(segment)}
												className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
											/>
											{segment}
										</label>
									))}
								</div>
								{segments.length === 0 && (
									<p className="text-xs text-red-400 mt-2">
										Select at least one segment.
									</p>
								)}
							</div>
						</section>

						<section className="space-y-6">
							<h2 className="text-2xl font-semibold text-white">Team Members</h2>
							<p className="text-neutral-400 text-sm">
								Add each teammate&apos;s details below. Contact numbers should have 10 digits.
							</p>

							<div className="space-y-6">
								{teamMembers.map((member, index) => {
									const fullNameId = `member-${index}-full-name`;
									const departmentId = `member-${index}-department`;
									const emailId = `member-${index}-email`;
									const contactId = `member-${index}-contact`;
									const rollId = `member-${index}-roll`;
									const yearId = `member-${index}-year`;
									const linkedinId = `member-${index}-linkedin`;

									return (
										<div
											key={fullNameId}
											className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60"
										>
											<div className="flex items-center justify-between mb-4">
												<h3 className="text-lg font-semibold text-white">
													{memberLabels[index]}
												</h3>
												<span className="text-xs text-neutral-500">
													{index === 0 ? "Primary contact" : `Member ${index + 1}`}
												</span>
											</div>

											<div className="grid gap-4 md:grid-cols-2">
												<LabelInputContainer>
													<Label htmlFor={fullNameId}>Full Name</Label>
													<Input
														id={fullNameId}
														value={member.fullName}
														onChange={(event) =>
															updateTeamMember(index, "fullName", event.target.value)
														}
														placeholder="Enter full name"
														required
													/>
												</LabelInputContainer>

												<LabelInputContainer>
													<Label htmlFor={departmentId}>Select Your Department</Label>
													<select
														id={departmentId}
														value={member.department}
														onChange={(event) =>
															updateTeamMember(index, "department", event.target.value)
														}
														className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
														required
													>
														<option value="">Choose department</option>
														{DEPARTMENT_OPTIONS.map((dept) => (
															<option key={dept} value={dept}>
																{dept}
															</option>
														))}
													</select>
												</LabelInputContainer>

												<LabelInputContainer>
													<Label htmlFor={emailId}>Email</Label>
													<Input
														id={emailId}
														type="email"
														value={member.email}
														onChange={(event) =>
															updateTeamMember(index, "email", event.target.value)
														}
														placeholder="team.member@college.edu"
														required
													/>
												</LabelInputContainer>

												<LabelInputContainer>
													<Label htmlFor={contactId}>Contact Number</Label>
													<Input
														id={contactId}
														value={member.contactNumber}
														onChange={(event) =>
															updateTeamMember(
																index,
																"contactNumber",
																event.target.value.replace(/[^0-9]/g, "").slice(0, 10)
															)
														}
														placeholder="10-digit number"
														required
													/>
												</LabelInputContainer>

												<LabelInputContainer>
													<Label htmlFor={rollId}>Roll Number</Label>
													<Input
														id={rollId}
														value={member.rollNumber}
														onChange={(event) =>
															updateTeamMember(index, "rollNumber", event.target.value)
														}
														placeholder="College roll number"
														required
													/>
												</LabelInputContainer>

												<LabelInputContainer>
													<Label htmlFor={yearId}>Year of Study</Label>
													<select
														id={yearId}
														value={member.yearOfStudy}
														onChange={(event) =>
															updateTeamMember(index, "yearOfStudy", event.target.value)
														}
														className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
														required
													>
														<option value="">Select year</option>
														{YEAR_OF_STUDY_OPTIONS.map((year) => (
															<option key={year} value={year}>
																{year}
															</option>
														))}
													</select>
												</LabelInputContainer>
												<LabelInputContainer>
													<Label htmlFor={linkedinId}>LinkedIn Profile URL</Label>
													<Input
														id={linkedinId}
														value={member.linkedinProfile || ""}
														onChange={(event) =>
															updateTeamMember(index, "linkedinProfile", event.target.value)
														}
														placeholder="https://www.linkedin.com/in/username"
														required
													/>
												</LabelInputContainer>
											</div>
										</div>
									);
								})}
							</div>
						</section>

						<div className="flex flex-col sm:flex-row gap-4">
							<button
								type="submit"
								disabled={loading || uploadingImage || !isFormValid}
								className="bg-linear-to-br relative group/btn from-black to-neutral-600 w-full sm:w-auto px-6 text-white rounded-md h-11 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{uploadingImage ? "Uploading image..." : loading ? (existingData ? "Saving..." : "Submitting...") : existingData ? "Save Changes" : "Submit Registration"}
								<BottomGradient />
							</button>
							{existingData && (
								<button
									type="button"
									onClick={handleCancelEdit}
									disabled={loading}
									className="w-full sm:w-auto h-11 px-6 rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
								>
									Cancel
								</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

