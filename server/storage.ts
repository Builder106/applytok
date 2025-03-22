import {
  users,
  videos,
  applications,
  comments,
  messages,
  bookmarks,
  type User,
  type InsertUser,
  type Video,
  type InsertVideo,
  type Application,
  type InsertApplication,
  type Comment,
  type InsertComment,
  type Message,
  type InsertMessage,
  type Bookmark,
  type InsertBookmark,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUser(userId: number): Promise<Video[]>;
  getVideosByType(type: string, limit?: number, offset?: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<Video>): Promise<Video | undefined>;
  incrementVideoStat(id: number, stat: 'views' | 'likes' | 'comments' | 'shares'): Promise<Video | undefined>;
  recommendVideos(userId: number, limit?: number): Promise<Video[]>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getApplicationsByEmployer(employerId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Comment operations
  getComments(videoId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Message operations
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  
  // Bookmark operations
  getBookmarksByUser(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, videoId: number): Promise<void>;
  isBookmarked(userId: number, videoId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private applications: Map<number, Application>;
  private comments: Map<number, Comment>;
  private messages: Map<number, Message>;
  private bookmarks: Map<number, Bookmark>;
  
  private userIdCounter: number;
  private videoIdCounter: number;
  private applicationIdCounter: number;
  private commentIdCounter: number;
  private messageIdCounter: number;
  private bookmarkIdCounter: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.applications = new Map();
    this.comments = new Map();
    this.messages = new Map();
    this.bookmarks = new Map();
    
    this.userIdCounter = 1;
    this.videoIdCounter = 1;
    this.applicationIdCounter = 1;
    this.commentIdCounter = 1;
    this.messageIdCounter = 1;
    this.bookmarkIdCounter = 1;
    
    // Seed some initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user = { ...insertUser, id, createdAt } as User;
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByUser(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async getVideosByType(type: string, limit = 10, offset = 0): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter((video) => video.videoType === type)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(offset, offset + limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const createdAt = new Date();
    const video = {
      ...insertVideo,
      id,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt,
    } as Video;
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...videoData };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async incrementVideoStat(id: number, stat: 'views' | 'likes' | 'comments' | 'shares'): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, [stat]: (video[stat] || 0) + 1 };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async recommendVideos(userId: number, limit = 10): Promise<Video[]> {
    // Simple recommendation based on most recent videos
    // In a real implementation, this would include skills matching, etc.
    
    // Get user type
    const user = this.users.get(userId);
    if (!user) return [];
    
    // If job seeker, recommend job videos, if employer, recommend resumes
    const videoType = user.userType === 'job_seeker' ? 'job' : 'resume';
    
    return Array.from(this.videos.values())
      .filter((video) => video.videoType === videoType && video.userId !== userId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, limit);
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.userId === userId
    );
  }

  async getApplicationsByEmployer(employerId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.employerId === employerId
    );
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const createdAt = new Date();
    const application = { ...insertApplication, id, createdAt } as Application;
    this.applications.set(id, application);
    return application;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Comment operations
  async getComments(videoId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.videoId === videoId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const comment = { ...insertComment, id, createdAt } as Comment;
    this.comments.set(id, comment);
    
    // Increment comment count on video
    await this.incrementVideoStat(insertComment.videoId, 'comments');
    
    return comment;
  }

  // Message operations
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) =>
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const message = { ...insertMessage, id, read: false, createdAt } as Message;
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    Array.from(this.messages.values()).forEach((message) => {
      if (message.senderId === senderId && message.receiverId === receiverId && !message.read) {
        const updatedMessage = { ...message, read: true };
        this.messages.set(message.id, updatedMessage);
      }
    });
  }

  // Bookmark operations
  async getBookmarksByUser(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    // Check if already bookmarked
    const existing = await this.isBookmarked(insertBookmark.userId, insertBookmark.videoId);
    if (existing) {
      // Return existing bookmark
      const bookmark = Array.from(this.bookmarks.values()).find(
        (b) => b.userId === insertBookmark.userId && b.videoId === insertBookmark.videoId
      );
      return bookmark!;
    }
    
    const id = this.bookmarkIdCounter++;
    const createdAt = new Date();
    const bookmark = { ...insertBookmark, id, createdAt } as Bookmark;
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: number, videoId: number): Promise<void> {
    const bookmarkId = Array.from(this.bookmarks.values()).find(
      (bookmark) => bookmark.userId === userId && bookmark.videoId === videoId
    )?.id;
    
    if (bookmarkId) {
      this.bookmarks.delete(bookmarkId);
    }
  }

  async isBookmarked(userId: number, videoId: number): Promise<boolean> {
    return Array.from(this.bookmarks.values()).some(
      (bookmark) => bookmark.userId === userId && bookmark.videoId === videoId
    );
  }

  // Seed initial data
  private seedData() {
    // Create some users
    const employer1 = this.createUser({
      username: "techcorp",
      password: "password123",
      email: "hiring@techcorp.com",
      fullName: "TechCorp Inc.",
      headline: "Leading Technology Company",
      bio: "We build innovative software solutions for businesses worldwide.",
      location: "San Francisco, CA",
      userType: "employer",
      companyName: "TechCorp",
      companyLogo: "https://via.placeholder.com/150",
      skills: []
    });

    const employer2 = this.createUser({
      username: "innovatedesign",
      password: "password123",
      email: "careers@innovatedesign.com",
      fullName: "Innovate Design",
      headline: "Creative Design Agency",
      bio: "Award-winning design studio specializing in digital experiences.",
      location: "New York, NY",
      userType: "employer",
      companyName: "Innovate Design",
      companyLogo: "https://via.placeholder.com/150",
      skills: []
    });

    const jobSeeker1 = this.createUser({
      username: "sarahjohnson",
      password: "password123",
      email: "sarah@example.com",
      fullName: "Sarah Johnson",
      headline: "Full Stack Developer",
      bio: "Passionate full stack developer with 4+ years of experience building scalable web applications.",
      location: "San Francisco, CA",
      userType: "job_seeker",
      skills: ["JavaScript", "React", "Node.js", "MongoDB"]
    });

    const jobSeeker2 = this.createUser({
      username: "michaelwilson",
      password: "password123",
      email: "michael@example.com",
      fullName: "Michael Wilson",
      headline: "UX/UI Designer",
      bio: "Creative designer focused on creating intuitive user experiences.",
      location: "Seattle, WA",
      userType: "job_seeker",
      skills: ["UI Design", "Figma", "User Research", "Prototyping"]
    });

    // Create some videos with actual video URLs
    this.createVideo({
      userId: 1,
      title: "Senior Software Engineer",
      description: "We're looking for a passionate Senior Software Engineer to join our growing team!",
      videoUrl: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4", // Test video from Google
      thumbnailUrl: null,
      videoType: "job",
      skills: ["React", "Node.js", "AWS"],
      salary: "$120-150k",
      location: "Remote",
      jobType: "Full-time",
      duration: 58
    });

    this.createVideo({
      userId: 2,
      title: "UX Designer",
      description: "Join our creative team to design beautiful digital experiences.",
      videoUrl: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4", // Test video from Google
      thumbnailUrl: null,
      videoType: "job",
      skills: ["UI Design", "Figma", "User Research"],
      salary: "$90-120k",
      location: "New York, NY",
      jobType: "Full-time",
      duration: 45
    });

    this.createVideo({
      userId: 3, // Sarah Johnson
      title: "My Skills & Experience",
      description: "Here's a brief overview of my skills, experience, and what I can bring to your team.",
      videoUrl: "https://example.com/videos/sarah-resume.mp4",
      thumbnailUrl: "https://via.placeholder.com/300x500",
      videoType: "resume",
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
      duration: 58
    });

    this.createVideo({
      userId: 4, // Michael Wilson
      title: "UX Design Portfolio",
      description: "A walkthrough of my recent design projects and my approach to solving user problems.",
      videoUrl: "https://example.com/videos/michael-resume.mp4",
      thumbnailUrl: "https://via.placeholder.com/300x500",
      videoType: "resume",
      skills: ["UI Design", "Figma", "User Research", "Prototyping"],
      duration: 52
    });

    // Create some applications
    this.createApplication({
      jobVideoId: 1,
      userVideoId: 3,
      userId: 3, // Sarah applying
      employerId: 1, // to TechCorp
      status: "pending",
      note: "I'm very interested in this position and believe my skills are a perfect match."
    });

    this.createApplication({
      jobVideoId: 2,
      userVideoId: 4,
      userId: 4, // Michael applying
      employerId: 2, // to Innovate Design
      status: "viewed",
      note: "I'm excited about the opportunity to join your creative team."
    });

    // Create some comments
    this.createComment({
      videoId: 1,
      userId: 3,
      content: "This looks like an exciting opportunity! What tech stack does your team use?"
    });

    this.createComment({
      videoId: 3,
      userId: 1,
      content: "Impressive skills! I'd like to learn more about your experience with MongoDB."
    });

    // Create some messages
    this.createMessage({
      senderId: 1,
      receiverId: 3,
      content: "Hi Sarah, we liked your application. Would you be available for an interview next week?"
    });

    this.createMessage({
      senderId: 3,
      receiverId: 1,
      content: "Yes, I'm available. I'd be happy to schedule an interview. What times work for you?"
    });

    // Create some bookmarks
    this.createBookmark({
      userId: 3,
      videoId: 1
    });

    this.createBookmark({
      userId: 4,
      videoId: 2
    });
  }
}

export const storage = new MemStorage();
