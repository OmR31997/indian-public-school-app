"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  SlidersHorizontal,
  RefreshCw,
  LoaderCircle,
  ExternalLink,
  UserCheck,
  UserX,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  X,
  UploadCloud,
  ListPlus,
  HelpCircle,
} from "lucide-react";
import { CloudinaryGalleryModal } from "@/components/admin/CloudinaryGalleryModal";

export interface CustomField {
  key: string;
  label: string;
  value: string;
}

export interface ApplicationField {
  key: string;
  label: string;
  type: "text" | "number" | "email" | "file" | "select" | "textarea";
  required: boolean;
  options?: string[];
}

export interface CareerPostRecord {
  _id?: string;
  id?: string;
  title: string;
  qualification: string;
  image?: string;
  description?: string;
  customFields?: CustomField[];
  applicationFields?: ApplicationField[];
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export interface CareerApplicationRecord {
  _id?: string;
  id?: string;
  postId: string;
  postTitle: string;
  applicationNo: string;
  fullName: string;
  email: string;
  phone: string;
  coverNote?: string;
  resumeUrl?: string;
  customAnswers?: Record<string, string>;
  isRead?: boolean;
  status: "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED";
  createdAt?: string;
}

interface CareersAdminProps {
  apiUrl: string;
  token?: string;
  onRefreshNotifications?: () => void;
}

export function CareersAdmin({ apiUrl, token, onRefreshNotifications }: CareersAdminProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "applications">("posts");

  // Posts State
  const [posts, setPosts] = useState<CareerPostRecord[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [postSearch, setPostSearch] = useState<string>("");
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<CareerPostRecord | null>(null);

  // Post Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formQualification, setFormQualification] = useState<string>("");
  const [formImage, setFormImage] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formCustomFields, setFormCustomFields] = useState<CustomField[]>([]);
  const [formAppFields, setFormAppFields] = useState<ApplicationField[]>([]);
  const [savingPost, setSavingPost] = useState<boolean>(false);

  // Gallery Modal for Image selection
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Applications State
  const [applications, setApplications] = useState<CareerApplicationRecord[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [appSearch, setAppSearch] = useState<string>("");
  const [appPostFilter, setAppPostFilter] = useState<string>("ALL");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<CareerApplicationRecord | null>(null);

  const getHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Load Posts
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await axios.get(`${apiUrl}/careers?isActive=all`, {
        headers: getHeaders(),
      });
      const data = res.data;
      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      setPosts(list);
    } catch (err) {
      console.error("Failed to load career posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [apiUrl, getHeaders]);

  // Load Applications
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await axios.get(`${apiUrl}/careers/applications/all`, {
        headers: getHeaders(),
      });
      const data = res.data;
      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      setApplications(list);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoadingApps(false);
    }
  }, [apiUrl, getHeaders]);

  useEffect(() => {
    fetchPosts();
    fetchApplications();
  }, [fetchPosts, fetchApplications]);

  // Open Create/Edit Post Modal
  const handleOpenPostModal = (post?: CareerPostRecord) => {
    if (post) {
      setEditingPost(post);
      setFormTitle(post.title || "");
      setFormQualification(post.qualification || "");
      setFormImage(post.image || "");
      setFormDescription(post.description || "");
      setFormIsActive(post.isActive ?? true);
      setFormCustomFields(post.customFields ? [...post.customFields] : []);
      setFormAppFields(post.applicationFields ? [...post.applicationFields] : []);
    } else {
      setEditingPost(null);
      setFormTitle("");
      setFormQualification("");
      setFormImage("");
      setFormDescription("");
      setFormIsActive(true);
      setFormCustomFields([
        { key: "experience", label: "Experience", value: "2+ Years" },
        { key: "department", label: "Department", value: "Academics" },
      ]);
      setFormAppFields([
        { key: "notice_period", label: "Notice Period", type: "text", required: true },
      ]);
    }
    setIsPostModalOpen(true);
  };

  // Add Dynamic Custom Field to Post
  const handleAddCustomField = () => {
    setFormCustomFields((prev) => [
      ...prev,
      { key: `field_${Date.now()}`, label: "New Field", value: "" },
    ]);
  };

  const handleUpdateCustomField = (index: number, key: keyof CustomField, val: string) => {
    setFormCustomFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const handleRemoveCustomField = (index: number) => {
    setFormCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Dynamic Application Question to Post
  const handleAddAppField = () => {
    setFormAppFields((prev) => [
      ...prev,
      {
        key: `question_${Date.now()}`,
        label: "New Question",
        type: "text",
        required: false,
      },
    ]);
  };

  const handleUpdateAppField = (
    index: number,
    key: keyof ApplicationField,
    val: unknown
  ) => {
    setFormAppFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const handleRemoveAppField = (index: number) => {
    setFormAppFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Career Post
  const handleSavePost = async () => {
    if (!formTitle.trim() || !formQualification.trim()) {
      alert("Please fill in Name of Post and Qualification.");
      return;
    }

    setSavingPost(true);
    try {
      const payload = {
        title: formTitle.trim(),
        qualification: formQualification.trim(),
        image: formImage.trim(),
        description: formDescription.trim(),
        isActive: formIsActive,
        customFields: formCustomFields.map((f) => ({
          key: f.key.trim().toLowerCase().replace(/\s+/g, "_"),
          label: f.label.trim(),
          value: f.value.trim(),
        })),
        applicationFields: formAppFields.map((q) => ({
          key: q.key.trim().toLowerCase().replace(/\s+/g, "_"),
          label: q.label.trim(),
          type: q.type,
          required: q.required,
          options: q.options || [],
        })),
      };

      const postId = editingPost?._id || editingPost?.id;
      if (postId) {
        await axios.patch(`${apiUrl}/careers/${postId}`, payload, {
          headers: getHeaders(),
        });
      } else {
        await axios.post(`${apiUrl}/careers`, payload, {
          headers: getHeaders(),
        });
      }

      setIsPostModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      alert(`Error saving career post: ${err?.response?.data?.message || err.message}`);
    } finally {
      setSavingPost(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career post?")) return;
    try {
      await axios.delete(`${apiUrl}/careers/${id}`, { headers: getHeaders() });
      fetchPosts();
    } catch (err: any) {
      alert(`Failed to delete post: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Toggle Post Active Status
  const handleTogglePostStatus = async (post: CareerPostRecord) => {
    const id = post._id || post.id;
    if (!id) return;
    try {
      await axios.patch(
        `${apiUrl}/careers/${id}`,
        { isActive: !post.isActive },
        { headers: getHeaders() }
      );
      fetchPosts();
    } catch (err: any) {
      alert(`Failed to toggle status: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Application Status Change
  const handleUpdateAppStatus = async (
    id: string,
    newStatus: "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED"
  ) => {
    try {
      await axios.patch(
        `${apiUrl}/careers/applications/${id}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      if (selectedApp && (selectedApp._id === id || selectedApp.id === id)) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchApplications();
      if (onRefreshNotifications) onRefreshNotifications();
    } catch (err: any) {
      alert(`Failed to update application status: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Delete Application
  const handleDeleteApp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application record?")) return;
    try {
      await axios.delete(`${apiUrl}/careers/applications/${id}`, {
        headers: getHeaders(),
      });
      if (selectedApp && (selectedApp._id === id || selectedApp.id === id)) {
        setSelectedApp(null);
      }
      fetchApplications();
      if (onRefreshNotifications) onRefreshNotifications();
    } catch (err: any) {
      alert(`Failed to delete application: ${err?.response?.data?.message || err.message}`);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = postSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.qualification.toLowerCase().includes(q)
    );
  });

  const filteredApps = applications.filter((app) => {
    const q = appSearch.toLowerCase();
    const matchesSearch =
      app.fullName.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.phone.toLowerCase().includes(q) ||
      app.applicationNo.toLowerCase().includes(q) ||
      app.postTitle.toLowerCase().includes(q);

    const matchesPost = appPostFilter === "ALL" || app.postId === appPostFilter;
    const matchesStatus = appStatusFilter === "ALL" || app.status === appStatusFilter;

    return matchesSearch && matchesPost && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls & Tabs - IPS Navy (#102a4c) & Gold (#f4bd4f) Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#102a4c] text-[#f4bd4f] flex items-center justify-center shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#102a4c] dark:text-white font-display">
              Careers & Job Openings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage openings, dynamic table columns & candidate applications
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "posts"
                ? "bg-[#102a4c] text-[#f4bd4f] shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-[#102a4c] dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Job Openings ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "applications"
                ? "bg-[#102a4c] text-[#f4bd4f] shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-[#102a4c] dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Applications Hub ({applications.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: JOB OPENINGS LIST */}
      {/* ========================================================= */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder="Search job title or qualification..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5d9c]/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchPosts}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh Openings"
              >
                <RefreshCw className={`w-4 h-4 ${loadingPosts ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => handleOpenPostModal()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102a4c] hover:bg-[#1a5d9c] text-[#f4bd4f] font-bold text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Career Opening
              </button>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {loadingPosts ? (
              <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
                <LoaderCircle className="w-5 h-5 animate-spin text-[#1a5d9c]" />
                <span>Loading career openings...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No career openings found
                </p>
                <p className="text-xs text-slate-400">
                  Click "Add Career Opening" to create your first dynamic job post.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-[#102a4c] text-white font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center border-r border-white/10">S.No</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Image</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Name of Post</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Qualification</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Dynamic Fields</th>
                      <th className="py-3.5 px-4 text-center border-r border-white/10">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPosts.map((post, idx) => {
                      const id = post._id || post.id || String(idx);
                      return (
                        <tr
                          key={id}
                          className="hover:bg-[#edf5fc] dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-center text-slate-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#102a4c] border border-white/10 text-[#f4bd4f] flex items-center justify-center font-bold text-xs">
                                {post.title.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#102a4c] dark:text-white">
                            {post.title}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                            {post.qualification}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {post.customFields && post.customFields.length > 0 ? (
                                post.customFields.map((cf, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full bg-[#fdf3da] text-[#b7790a] dark:bg-slate-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200/60 dark:border-amber-900/40"
                                  >
                                    {cf.label}: {cf.value}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">Standard</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleTogglePostStatus(post)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                post.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {post.isActive ? "ACTIVE / OPEN" : "CLOSED"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenPostModal(post)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Opening"
                              >
                                <Pencil className="w-4 h-4 text-[#1a5d9c]" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(id)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete Opening"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: APPLICATIONS HUB */}
      {/* ========================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search candidate name, email, phone or APP ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5d9c]/40"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={appPostFilter}
                onChange={(e) => setAppPostFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-medium"
              >
                <option value="ALL">All Job Positions</option>
                {posts.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <option key={pid} value={pid}>
                      {p.title}
                    </option>
                  );
                })}
              </select>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="SHORTLISTED">SHORTLISTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="HIRED">HIRED</option>
              </select>

              <button
                onClick={fetchApplications}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh Applications"
              >
                <RefreshCw className={`w-4 h-4 ${loadingApps ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {loadingApps ? (
              <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
                <LoaderCircle className="w-5 h-5 animate-spin text-[#1a5d9c]" />
                <span>Loading applications...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No applications received matching filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-[#102a4c] text-white font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 border-r border-white/10">Ref No</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Candidate</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Job Position</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Contact</th>
                      <th className="py-3.5 px-4 border-r border-white/10">Applied Date</th>
                      <th className="py-3.5 px-4 text-center border-r border-white/10">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApps.map((app) => {
                      const id = app._id || app.id || "";
                      return (
                        <tr
                          key={id}
                          className="hover:bg-[#edf5fc] dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-[#1a5d9c]">
                            {app.applicationNo}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#102a4c] dark:text-white">
                            <span>{app.fullName}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {app.postTitle}
                          </td>
                          <td className="py-3 px-4">
                            <div>{app.email}</div>
                            <div className="text-[11px] text-slate-400">{app.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleUpdateAppStatus(
                                  id,
                                  e.target.value as "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED"
                                )
                              }
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                app.status === "HIRED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : app.status === "SHORTLISTED"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : app.status === "REJECTED"
                                  ? "bg-red-50 text-red-700 border-red-300"
                                  : "bg-[#fdf3da] text-[#b7790a] border-amber-300"
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="REJECTED">REJECTED</option>
                              <option value="HIRED">HIRED</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-[#1a5d9c]" />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(id)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT CAREER POST */}
      {/* ========================================================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-[#102a4c] dark:text-white flex items-center gap-2 font-display">
                <Briefcase className="w-5 h-5 text-[#1a5d9c]" />
                {editingPost ? "Edit Career Opening" : "Create Dynamic Career Opening"}
              </h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="block font-semibold text-[#102a4c] dark:text-slate-200 mb-1">
                  Name of Post <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. PGT Mathematics, Computer Teacher, Accountant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1a5d9c]/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102a4c] dark:text-slate-200 mb-1">
                  Qualification Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formQualification}
                  onChange={(e) => setFormQualification(e.target.value)}
                  placeholder="e.g. M.Sc / M.A with B.Ed, minimum 3 years teaching experience"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1a5d9c]/40 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102a4c] dark:text-slate-200 mb-1">Post / Category Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Image URL or choose from gallery"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1a5d9c]/40 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4 text-[#1a5d9c]" />
                    <span>Select Media</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#102a4c] dark:text-slate-200 mb-1">Detailed Job Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Job roles, duties, key responsibilities..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1a5d9c]/40 outline-none"
                />
              </div>

              {/* DYNAMIC CUSTOM FIELDS FOR TABLE COLUMNS */}
              <div className="p-4 rounded-2xl bg-[#edf5fc] dark:bg-slate-800/60 border border-blue-200/60 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#102a4c] dark:text-white flex items-center gap-1.5">
                      <ListPlus className="w-4 h-4 text-[#1a5d9c]" />
                      Dynamic Custom Columns / Fields
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Add extra fields displayed in the public careers table (e.g. Experience, Salary, Location)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-3 py-1.5 bg-[#1a5d9c] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#102a4c] transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Column Field
                  </button>
                </div>

                {formCustomFields.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No custom fields added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {formCustomFields.map((cf, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cf.label}
                          onChange={(e) =>
                            handleUpdateCustomField(idx, "label", e.target.value)
                          }
                          placeholder="Field Label (e.g. Experience)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900 outline-none"
                        />
                        <input
                          type="text"
                          value={cf.value}
                          onChange={(e) =>
                            handleUpdateCustomField(idx, "value", e.target.value)
                          }
                          placeholder="Value (e.g. 3+ Years)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(idx)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DYNAMIC APPLICATION FORM QUESTIONS */}
              <div className="p-4 rounded-2xl bg-[#fdf3da]/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#102a4c] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#b7790a]" />
                      Dynamic Application Form Questions
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Define questions candidates must answer when clicking "Apply"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAppField}
                    className="px-3 py-1.5 bg-[#102a4c] text-[#f4bd4f] rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#1a5d9c] hover:text-white transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Form Question
                  </button>
                </div>

                {formAppFields.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No custom application form questions added.</p>
                ) : (
                  <div className="space-y-2">
                    {formAppFields.map((q, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => handleUpdateAppField(idx, "label", e.target.value)}
                          placeholder="Question / Label"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900 outline-none"
                        />
                        <select
                          value={q.type}
                          onChange={(e) => handleUpdateAppField(idx, "type", e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900 outline-none font-medium"
                        >
                          <option value="text">Text Input</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="textarea">Textarea</option>
                        </select>
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => handleUpdateAppField(idx, "required", e.target.checked)}
                            className="rounded border-slate-300 text-[#102a4c]"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveAppField(idx)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-[#102a4c] dark:text-slate-200">Position Status</span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-4 py-1.5 rounded-full font-bold text-[11px] transition-all ${
                    formIsActive
                      ? "bg-[#102a4c] text-[#f4bd4f] shadow-xs"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {formIsActive ? "ACTIVE / OPEN FOR APPLICATION" : "CLOSED"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={savingPost}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#102a4c] hover:bg-[#1a5d9c] text-white shadow-md flex items-center gap-2"
              >
                {savingPost ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#f4bd4f]" />}
                <span>{editingPost ? "Update Opening" : "Create Opening"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CANDIDATE APPLICATION DETAILS */}
      {/* ========================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#fdf3da] text-[#b7790a] border border-amber-200">
                  {selectedApp.applicationNo}
                </span>
                <h3 className="text-lg font-bold text-[#102a4c] dark:text-white mt-1 font-display">
                  {selectedApp.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400">Position Applied For</span>
                  <div className="font-bold text-[#102a4c] dark:text-white">
                    {selectedApp.postTitle}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Application Date</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedApp.createdAt
                      ? new Date(selectedApp.createdAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Email Address</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedApp.email}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Contact Number</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedApp.phone}
                  </div>
                </div>
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div>
                  <h4 className="font-bold text-[#102a4c] dark:text-white mb-1">
                    Cover Letter / Statement
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                    {selectedApp.coverNote}
                  </div>
                </div>
              )}

              {/* Dynamic Answers */}
              {selectedApp.customAnswers &&
                Object.keys(selectedApp.customAnswers).length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#102a4c] dark:text-white mb-1.5">
                      Dynamic Form Answers
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedApp.customAnswers).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          <span className="font-semibold capitalize text-slate-600 dark:text-slate-400">
                            {k.replace(/_/g, " ")}:
                          </span>
                          <span className="font-bold text-[#102a4c] dark:text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Resume attachment */}
              <div>
                <h4 className="font-bold text-[#102a4c] dark:text-white mb-1.5">
                  Resume / CV Document
                </h4>
                {selectedApp.resumeUrl ? (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102a4c] hover:bg-[#1a5d9c] text-white font-bold shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4 text-[#f4bd4f]" />
                    <span>View Resume Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No resume URL attached.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    const id = selectedApp._id || selectedApp.id || "";
                    handleUpdateAppStatus(
                      id,
                      e.target.value as "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED"
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="HIRED">HIRED</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#102a4c] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary Gallery Selection Modal */}
      {isGalleryOpen && (
        <CloudinaryGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelectImage={(url: string) => {
            setFormImage(url);
            setIsGalleryOpen(false);
          }}
        />
      )}
    </div>
  );
}
