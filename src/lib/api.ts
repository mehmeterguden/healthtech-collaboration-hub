import {
  User,
  Post,
  MeetingRequest,
  ActivityLog,
  Interest,
  PlatformStats,
  DashboardStats,
  Notification,
  PostStatus,
} from "@/types";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "An error occurred");
  }

  return res.json();
}

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return fetcher("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    institution: string;
    city: string;
    country: string;
  }): Promise<{ user: User; token: string }> {
    return fetcher("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(code: string): Promise<{ success: boolean }> {
    return fetcher("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return fetcher("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async me(): Promise<{ user: User }> {
    return fetcher("/api/auth/me");
  },
  
  async logout(): Promise<{ success: boolean }> {
    return fetcher("/api/auth/logout", {
      method: "POST",
    });
  }
};

export const postsApi = {
  async getAll(filters?: {
    domain?: string;
    expertise?: string;
    city?: string;
    country?: string;
    stage?: string;
    status?: PostStatus;
    search?: string;
  }): Promise<Post[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return fetcher(`/api/posts?${params.toString()}`);
  },

  async getById(id: string): Promise<Post> {
    return fetcher(`/api/posts/${id}`);
  },

  async create(data: Partial<Post>): Promise<Post> {
    return fetcher("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Post>): Promise<Post> {
    return fetcher(`/api/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async expressInterest(postId: string, message: string): Promise<Interest> {
    return fetcher(`/api/posts/${postId}/interests`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  async getInterests(postId: string): Promise<Interest[]> {
    return fetcher(`/api/posts/${postId}/interests`);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return fetcher(`/api/posts/${id}`, {
      method: "DELETE",
    });
  },
};

export const meetingsApi = {
  async getAll(): Promise<MeetingRequest[]> {
    return fetcher("/api/meetings");
  },

  async create(data: {
    postId: string;
    receiverId: string;
    message: string;
    proposedSlots: { date: string; startTime: string; endTime: string }[];
  }): Promise<MeetingRequest> {
    return fetcher("/api/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async accept(id: string, slotId: string): Promise<MeetingRequest> {
    return fetcher(`/api/meetings/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
  },

  async decline(id: string): Promise<MeetingRequest> {
    return fetcher(`/api/meetings/${id}/decline`, {
      method: "POST",
    });
  },

  async cancel(id: string): Promise<MeetingRequest> {
    return fetcher(`/api/meetings/${id}/cancel`, {
      method: "POST",
    });
  },
};

export const usersApi = {
  async getProfile(): Promise<User> {
    return fetcher("/api/users/profile");
  },

  async getBySlug(slug: string): Promise<User> {
    return fetcher(`/api/users/${slug}`);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return fetcher("/api/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    return fetcher("/api/users/profile", {
      method: "DELETE",
    });
  },

  async exportData(): Promise<{ downloadUrl: string }> {
    return fetcher("/api/users/export");
  },
};

export const adminApi = {
  async getStats(): Promise<PlatformStats> {
    return fetcher("/api/admin/stats");
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return fetcher("/api/admin/dashboard-stats");
  },

  async getAllPosts(): Promise<Post[]> {
    return fetcher("/api/admin/posts");
  },

  async removePost(id: string): Promise<{ success: boolean }> {
    return fetcher(`/api/admin/posts/${id}`, {
      method: "DELETE",
    });
  },

  async getAllUsers(): Promise<User[]> {
    return fetcher("/api/admin/users");
  },

  async suspendUser(id: string): Promise<{ success: boolean }> {
    return fetcher(`/api/admin/users/${id}/suspend`, {
      method: "POST",
    });
  },

  async activateUser(id: string): Promise<{ success: boolean }> {
    return fetcher(`/api/admin/users/${id}/activate`, {
      method: "POST",
    });
  },

  async getLogs(filters?: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return fetcher(`/api/admin/logs?${params.toString()}`);
  },

  async getNotifications(): Promise<Notification[]> {
    return fetcher("/api/notifications");
  },

  async exportLogs(): Promise<{ downloadUrl: string }> {
    return fetcher("/api/admin/logs/export");
  },
};
