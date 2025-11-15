"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/form-inputs";
import {
  Label,
  LabelInputContainer,
  BottomGradient,
} from "@/components/ui/form-components";

const projectCategories = [
  "Web Development",
  "Mobile App Development",
  "AI/ML",
  "Data Science",
  "IoT",
  "Blockchain",
  "Cybersecurity",
  "Game Development",
  "AR/VR",
  "Cloud Computing",
  "Other",
];

const targetAudiences = [
  "Students",
  "Teachers",
  "General Public",
  "Researchers",
  "Industry",
  "Other",
];

interface Project {
  projectYear: string;
  projectName: string;
  projectDescription: string;
  projectCategory: string;
  projectPhotos: string[];
  projectDocumentation: string;
  projectLink: string;
  technologyStack: string[];
  targetAudience: string[];
}

export default function CollegeRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Personal Details
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [currentYear, setCurrentYear] = useState<"2nd Year" | "3rd Year" | "">(
    ""
  );
  const [academicSession, setAcademicSession] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [techInput, setTechInput] = useState<{ [key: number]: string }>({});
  const [customAudienceInput, setCustomAudienceInput] = useState<{ [key: number]: string }>({});

  const initializeProjects = (year: "2nd Year" | "3rd Year") => {
    const years = year === "2nd Year" ? ["First Year"] : ["First Year", "Second Year"];
    setProjects(
      years.map((projectYear) => ({
        projectYear,
        projectName: "",
        projectDescription: "",
        projectCategory: "",
        projectPhotos: [],
        projectDocumentation: "",
        projectLink: "",
        technologyStack: [],
        targetAudience: [],
      }))
    );
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const addTech = (projectIndex: number) => {
    const tech = techInput[projectIndex]?.trim();
    if (tech) {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].technologyStack.push(tech);
      setProjects(updatedProjects);
      setTechInput({ ...techInput, [projectIndex]: "" });
    }
  };

  const removeTech = (projectIndex: number, techIndex: number) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].technologyStack.splice(techIndex, 1);
    setProjects(updatedProjects);
  };

  const addCustomAudience = (projectIndex: number) => {
    const custom = customAudienceInput[projectIndex]?.trim();
    if (custom && !projects[projectIndex].targetAudience.includes(custom)) {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].targetAudience.push(custom);
      setProjects(updatedProjects);
      setCustomAudienceInput({ ...customAudienceInput, [projectIndex]: "" });
    }
  };

  const removeAudience = (projectIndex: number, audience: string) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].targetAudience = updatedProjects[projectIndex].targetAudience.filter((a) => a !== audience);
    setProjects(updatedProjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/college-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          email,
          password,
          phoneNumber,
          collegeName,
          currentYear,
          academicSession,
          rollNumber,
          projects,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Your application is pending approval.");
        router.push("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => {
    return (
      studentName &&
      email &&
      password.length >= 6 &&
      phoneNumber.match(/^[0-9]{10}$/) &&
      collegeName &&
      currentYear &&
      academicSession &&
      rollNumber
    );
  };

  const isStep2Valid = () => {
    return projects.every(
      (p) =>
        p.projectName &&
        p.projectDescription &&
        p.projectCategory &&
        p.projectPhotos.length > 0 &&
        p.targetAudience.length > 0
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-neutral-900 to-neutral-950 rounded-2xl p-8 shadow-2xl border border-neutral-800">
          <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            College Student Registration
          </h1>
          <p className="text-neutral-400 mb-8">
            Register your projects for Vigyan Mela 2025-26
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 1
                    ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                1
              </div>
              <span className="text-white font-medium">Personal Details</span>
            </div>
            <div className="w-16 h-1 bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= 2
                    ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                2
              </div>
              <span className="text-white font-medium">Project Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <LabelInputContainer>
                    <Label htmlFor="studentname">Student Name</Label>
                    <Input
                      id="studentname"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@college.edu"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="college">College Name</Label>
                    <Input
                      id="college"
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Your college name"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="year">Current Year of Study</Label>
                    <select
                      id="year"
                      required
                      value={currentYear}
                      onChange={(e) => {
                        const year = e.target.value as "2nd Year" | "3rd Year";
                        setCurrentYear(year);
                        if (year) initializeProjects(year);
                      }}
                      className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </select>
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="academicSession">Academic Session</Label>
                    <Input
                      id="academicSession"
                      type="text"
                      required
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      placeholder="e.g., 2025-26"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer className="md:col-span-2">
                    <Label htmlFor="rollnumber">Roll Number</Label>
                    <Input
                      id="rollnumber"
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="Your roll/registration number"
                    />
                  </LabelInputContainer>
                </div>

                <button
                  type="button"
                  disabled={isNavigating}
                  onClick={() => {
                    if (isStep1Valid()) {
                      setIsNavigating(true);
                      setCurrentStep(2);
                      setTimeout(() => setIsNavigating(false), 300);
                    } else {
                      alert("Please fill all required fields correctly");
                    }
                  }}
                  className="bg-linear-to-br relative group/btn from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNavigating ? "Loading..." : "Next: Project Details →"}
                  <BottomGradient />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Project Details
                </h2>
                <p className="text-neutral-400 mb-6">
                  {currentYear === "2nd Year"
                    ? "Upload 1 project from your First Year"
                    : "Upload 2 projects: one from First Year and one from Second Year"}
                </p>

                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800"
                  >
                    <h3 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
                      {project.projectYear} Project
                    </h3>

                    <div className="space-y-6">
                      <LabelInputContainer>
                        <Label htmlFor={`projectname-${index}`}>Project Name</Label>
                        <Input
                          id={`projectname-${index}`}
                          type="text"
                          required
                          value={project.projectName}
                          onChange={(e) =>
                            updateProject(index, "projectName", e.target.value)
                          }
                          placeholder="Enter project name"
                        />
                      </LabelInputContainer>

                      <LabelInputContainer>
                        <Label htmlFor={`description-${index}`}>Project Description</Label>
                        <textarea
                          id={`description-${index}`}
                          required
                          value={project.projectDescription}
                          onChange={(e) =>
                            updateProject(
                              index,
                              "projectDescription",
                              e.target.value
                            )
                          }
                          className="flex min-h-[120px] w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe your project..."
                        />
                      </LabelInputContainer>

                      <div className="grid md:grid-cols-2 gap-6">
                        <LabelInputContainer>
                          <Label htmlFor={`category-${index}`}>Project Category</Label>
                          <select
                            id={`category-${index}`}
                            required
                            value={project.projectCategory}
                            onChange={(e) =>
                              updateProject(
                                index,
                                "projectCategory",
                                e.target.value
                              )
                            }
                            className="flex h-10 w-full border-none bg-neutral-800 text-white rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select Category</option>
                            {projectCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </LabelInputContainer>

                        <LabelInputContainer>
                          <Label htmlFor={`audience-${index}`}>Target Audience</Label>
                          <div className="space-y-3">
                            {/* Predefined options */}
                            <div className="space-y-2">
                              {targetAudiences.map((aud) => (
                                <label
                                  key={aud}
                                  className="flex items-center gap-2 text-white cursor-pointer hover:bg-neutral-800/50 p-2 rounded-md transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={project.targetAudience.includes(aud)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        updateProject(index, "targetAudience", [...project.targetAudience, aud]);
                                      } else {
                                        updateProject(index, "targetAudience", project.targetAudience.filter((a) => a !== aud));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                                  />
                                  <span className="text-sm">{aud}</span>
                                </label>
                              ))}
                            </div>

                            {/* Custom audience input when "Other" is checked */}
                            {project.targetAudience.includes("Other") && (
                              <div className="bg-neutral-800/50 p-3 rounded-md border border-neutral-700">
                                <Label htmlFor={`custom-audience-${index}`} className="text-sm mb-2">
                                  Specify Other Audience
                                </Label>
                                <div className="flex gap-2 mt-2">
                                  <Input
                                    id={`custom-audience-${index}`}
                                    type="text"
                                    value={customAudienceInput[index] || ""}
                                    onChange={(e) => setCustomAudienceInput({ ...customAudienceInput, [index]: e.target.value })}
                                    placeholder="e.g., Government Officials, NGOs"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomAudience(index);
                                      }
                                    }}
                                    className="flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => addCustomAudience(index)}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition text-sm font-medium"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Display selected audiences as badges */}
                            {project.targetAudience.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.targetAudience.map((aud, audIdx) => (
                                  <span
                                    key={audIdx}
                                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs flex items-center gap-2"
                                  >
                                    {aud}
                                    <button
                                      type="button"
                                      onClick={() => removeAudience(index, aud)}
                                      className="hover:text-red-400 transition"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {project.targetAudience.length === 0 && (
                              <p className="text-red-400 text-xs mt-1">
                                Please select at least one target audience
                              </p>
                            )}
                          </div>
                        </LabelInputContainer>
                      </div>

                      <LabelInputContainer>
                        <Label htmlFor={`photos-${index}`}>Project Photos (Screenshots/Images)</Label>
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_us_preset"}
                          onSuccess={(result: any) => {
                            const url = result.info.secure_url;
                            updateProject(index, "projectPhotos", [
                              ...project.projectPhotos,
                              url,
                            ]);
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 hover:shadow-md transition duration-200"
                            >
                              Upload Photo
                              <BottomGradient />
                            </button>
                          )}
                        </CldUploadWidget>
                        {project.projectPhotos.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-3">
                            {project.projectPhotos.map((photo, i) => (
                              <div key={i} className="relative group">
                                <img
                                  src={photo}
                                  alt={`Project ${i + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-neutral-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = project.projectPhotos.filter(
                                      (_, idx) => idx !== i
                                    );
                                    updateProject(index, "projectPhotos", updated);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </LabelInputContainer>

                      <LabelInputContainer>
                        <Label htmlFor={`docs-${index}`}>Project Documentation (PDF) - Optional</Label>
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_us_preset"}
                          options={{ resourceType: "raw" }}
                          onSuccess={(result: any) => {
                            updateProject(
                              index,
                              "projectDocumentation",
                              result.info.secure_url
                            );
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 hover:shadow-md transition duration-200"
                            >
                              {project.projectDocumentation ? "✓ PDF Uploaded" : "Upload PDF"}
                              <BottomGradient />
                            </button>
                          )}
                        </CldUploadWidget>
                      </LabelInputContainer>

                      <LabelInputContainer>
                        <Label htmlFor={`link-${index}`}>Project Link (GitHub/Demo) - Optional</Label>
                        <Input
                          id={`link-${index}`}
                          type="url"
                          value={project.projectLink}
                          onChange={(e) =>
                            updateProject(index, "projectLink", e.target.value)
                          }
                          placeholder="https://github.com/..."
                        />
                      </LabelInputContainer>

                      <LabelInputContainer>
                        <Label htmlFor={`tech-${index}`}>Technology Stack - Optional</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`tech-${index}`}
                            type="text"
                            value={techInput[index] || ""}
                            onChange={(e) =>
                              setTechInput({ ...techInput, [index]: e.target.value })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTech(index);
                              }
                            }}
                            placeholder="e.g., React, Node.js (press Enter)"
                          />
                          <button
                            type="button"
                            onClick={() => addTech(index)}
                            className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:opacity-90 transition shrink-0"
                          >
                            Add
                          </button>
                        </div>
                        {project.technologyStack.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {project.technologyStack.map((tech, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2 border border-cyan-500/30"
                              >
                                {tech}
                                <button
                                  type="button"
                                  onClick={() => removeTech(index, i)}
                                  className="text-red-400 hover:text-red-300 font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </LabelInputContainer>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={isNavigating || loading}
                    onClick={() => {
                      setIsNavigating(true);
                      setCurrentStep(1);
                      setTimeout(() => setIsNavigating(false), 300);
                    }}
                    className="bg-neutral-800 relative group/btn block w-full text-white rounded-md h-10 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                    <BottomGradient />
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isStep2Valid()}
                    className="bg-linear-to-br relative group/btn from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                    <BottomGradient />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
