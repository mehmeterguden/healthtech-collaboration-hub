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
import {
  USERS,
  POSTS,
  INTERESTS,
  MEETINGS,
  LOGS,
  NOTIFICATIONS,
  PLATFORM_STATS,
  DASHBOARD_STATS,
} from "./mock-data";

function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * ms));
}

export const authApi = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(600);
    const user = USERS.find((u) => u.email === email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return { user, token: "mock-jwt-token-" + user.id };
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
    await delay(800);
    if (!data.email.endsWith(".edu")) {
      throw new Error("Only institutional .edu email addresses are allowed");
    }
    const newUser: User = {
      id: "u" + (USERS.length + 1),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as User["role"],
      institution: data.institution,
      city: data.city,
      country: data.country,
      expertise: [],
      bio: "",
      avatarUrl: "",
      profileCompleteness: 40,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: new Date().toISOString(),
      postCount: 0,
      meetingCount: 0,
      matchRate: 0,
    };
    return { user: newUser, token: "mock-jwt-token-" + newUser.id };
  },

  async verifyEmail(code: string): Promise<{ success: boolean }> {
    await delay(500);
    if (code === "123456") {
      return { success: true };
    }
    throw new Error("Invalid verification code");
  },

  async forgotPassword(_email: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },
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
    await delay(400);
    let filtered = [...POSTS];
    if (filters) {
      if (filters.domain) {
        filtered = filtered.filter((p) =>
          p.domain.toLowerCase().includes(filters.domain!.toLowerCase())
        );
      }
      if (filters.city) {
        filtered = filtered.filter((p) =>
          p.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters.country) {
        filtered = filtered.filter((p) =>
          p.country.toLowerCase().includes(filters.country!.toLowerCase())
        );
      }
      if (filters.stage) {
        filtered = filtered.filter((p) => p.projectStage === filters.stage);
      }
      if (filters.status) {
        filtered = filtered.filter((p) => p.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.domain.toLowerCase().includes(q)
        );
      }
    }
    return filtered;
  },

  async getById(id: string): Promise<Post> {
    await delay(300);
    const post = POSTS.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    return post;
  },

  async create(data: Partial<Post>): Promise<Post> {
    await delay(700);
    const newPost: Post = {
      id: "p" + (POSTS.length + 1),
      authorId: "u1",
      author: USERS[0],
      title: data.title || "",
      domain: data.domain || "",
      description: data.description || "",
      requiredExpertise: data.requiredExpertise || [],
      projectStage: data.projectStage || "idea",
      commitmentLevel: data.commitmentLevel || "medium",
      collaborationType: data.collaborationType || "research_partner",
      confidentialityLevel: data.confidentialityLevel || "public",
      city: data.city || "",
      country: data.country || "",
      status: "active",
      expiryDate: data.expiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      autoClose: data.autoClose || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interestCount: 0,
      highLevelIdea: data.highLevelIdea,
    };
    return newPost;
  },

  async update(id: string, data: Partial<Post>): Promise<Post> {
    await delay(500);
    const post = POSTS.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    return { ...post, ...data, updatedAt: new Date().toISOString() };
  },

  async expressInterest(postId: string, message: string): Promise<Interest> {
    await delay(500);
    return {
      id: "i" + (INTERESTS.length + 1),
      postId,
      userId: "u1",
      user: USERS[0],
      message,
      createdAt: new Date().toISOString(),
    };
  },

  async getInterests(postId: string): Promise<Interest[]> {
    await delay(300);
    return INTERESTS.filter((i) => i.postId === postId);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await delay(400);
    const post = POSTS.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    return { success: true };
  },
};

export const meetingsApi = {
  async getAll(): Promise<MeetingRequest[]> {
    await delay(400);
    return [...MEETINGS];
  },

  async create(data: {
    postId: string;
    receiverId: string;
    message: string;
    proposedSlots: { date: string; startTime: string; endTime: string }[];
  }): Promise<MeetingRequest> {
    await delay(600);
    const post = POSTS.find((p) => p.id === data.postId);
    const receiver = USERS.find((u) => u.id === data.receiverId);
    if (!post || !receiver) throw new Error("Invalid post or receiver");
    return {
      id: "m" + (MEETINGS.length + 1),
      postId: data.postId,
      post,
      requesterId: "u1",
      requester: USERS[0],
      receiverId: data.receiverId,
      receiver,
      message: data.message,
      proposedSlots: data.proposedSlots.map((s, i) => ({ ...s, id: `ts_new_${i}` })),
      status: "pending",
      ndaAccepted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async accept(id: string, slotId: string): Promise<MeetingRequest> {
    await delay(500);
    const meeting = MEETINGS.find((m) => m.id === id);
    if (!meeting) throw new Error("Meeting not found");
    const slot = meeting.proposedSlots.find((s) => s.id === slotId);
    return { ...meeting, status: "scheduled", selectedSlot: slot, updatedAt: new Date().toISOString() };
  },

  async decline(id: string): Promise<MeetingRequest> {
    await delay(400);
    const meeting = MEETINGS.find((m) => m.id === id);
    if (!meeting) throw new Error("Meeting not found");
    return { ...meeting, status: "declined", updatedAt: new Date().toISOString() };
  },

  async cancel(id: string): Promise<MeetingRequest> {
    await delay(400);
    const meeting = MEETINGS.find((m) => m.id === id);
    if (!meeting) throw new Error("Meeting not found");
    return { ...meeting, status: "cancelled", updatedAt: new Date().toISOString() };
  },
};

export const usersApi = {
  async getProfile(): Promise<User> {
    await delay(300);
    return USERS[0];
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay(500);
    return { ...USERS[0], ...data };
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    await delay(600);
    return { success: true };
  },

  async exportData(): Promise<{ downloadUrl: string }> {
    await delay(800);
    return { downloadUrl: "/mock-export.json" };
  },
};

export const adminApi = {
  async getStats(): Promise<PlatformStats> {
    await delay(500);
    return PLATFORM_STATS;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);
    return DASHBOARD_STATS;
  },

  async getAllPosts(): Promise<Post[]> {
    await delay(400);
    return [...POSTS];
  },

  async removePost(id: string): Promise<{ success: boolean }> {
    await delay(400);
    return { success: true };
  },

  async getAllUsers(): Promise<User[]> {
    await delay(400);
    return [...USERS];
  },

  async suspendUser(id: string): Promise<{ success: boolean }> {
    await delay(400);
    return { success: true };
  },

  async activateUser(id: string): Promise<{ success: boolean }> {
    await delay(400);
    return { success: true };
  },

  async getLogs(filters?: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityLog[]> {
    await delay(400);
    let filtered = [...LOGS];
    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter((l) => l.userId === filters.userId);
      }
      if (filters.actionType) {
        filtered = filtered.filter((l) => l.actionType === filters.actionType);
      }
    }
    return filtered;
  },

  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    return [...NOTIFICATIONS];
  },

  async exportLogs(): Promise<{ downloadUrl: string }> {
    await delay(600);
    return { downloadUrl: "/mock-logs-export.csv" };
  },
};
