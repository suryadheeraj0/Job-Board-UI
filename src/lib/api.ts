export const API_BASE = "https://job-board-backend-production-f330.up.railway.app";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  token?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  createdAt?: string;
  postedAt?: string;
  isRemote?: boolean;
  isUrgent?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  jobTitle?: string;
  company?: string;
  status: "APPLIED" | "SHORTLISTED" | "REJECTED";
  appliedAt?: string;
  createdAt?: string;
  coverLetter?: string;
  resumeUrl?: string;
  candidateName?: string;
  candidateEmail?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("tb_user");
    if (!raw) return null;
    return JSON.parse(raw)?.token ?? null;
  } catch {
    return null;
  }
}

const REQUEST_TIMEOUT = 15000;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data as T;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Request timeout - please try again");
    }
    throw e;
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.blob();
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; role?: string }) =>
    request<Record<string, unknown>>("/api/user/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<Record<string, unknown>>("/api/user/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Jobs
  listJobs: () => request<Job[]>("/api/jobs"),
  getJob: (id: string) => request<Job>(`/api/jobs/${id}`),
  createJob: (body: Partial<Job>) =>
    request<Job>("/api/jobs/postJob", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id: string, body: Partial<Job>) =>
    request<Job>(`/api/jobs/updateJob/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJob: (id: string) => request<void>(`/api/jobs/deleteJob/${id}`, { method: "DELETE" }),
  searchJobs: (q: Record<string, string>) => {
    const qs = new URLSearchParams(q).toString();
    return request<Job[]>(`/api/jobs/search?${qs}`);
  },

  // Applications
  apply: (body: { jobId: string; userId: string; coverLetter: string; resume: File }) => {
    const formData = new FormData();
    formData.append("jobId", body.jobId);
    formData.append("userId", body.userId);
    formData.append("coverLetter", body.coverLetter);
    formData.append("resume", body.resume);
    return request<Application>("/api/applications/postApplication", {
      method: "POST",
      body: formData,
    });
  },
  appsByJob: (jobId: string) => request<Application[]>(`/api/applications/job/${jobId}`),
  appsByUser: (userId: string) => request<Application[]>(`/api/applications/user/${userId}`),
  updateAppStatus: (applicationId: string, status: Application["status"], coverLetter: string) =>
    request<Application>(`/api/applications/updateApplication/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify({ status, coverLetter }),
    }),
  downloadResume: (applicationId: string) =>
    requestBlob(`/api/applications/${applicationId}/resume`),
};
