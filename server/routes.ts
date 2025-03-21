import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertVideoSchema,
  insertApplicationSchema,
  insertCommentSchema,
  insertMessageSchema,
  insertBookmarkSchema,
} from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingByUsername = await storage.getUserByUsername(userData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingByEmail = await storage.getUserByEmail(userData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string(),
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/users/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  app.patch("/api/users/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Only allow updating certain fields
      const updateSchema = insertUserSchema.partial().omit({ password: true });
      const userData = updateSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.session.userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Update failed" });
    }
  });

  // Video routes
  app.get("/api/videos", async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string || "10");
    const offset = parseInt(req.query.offset as string || "0");
    
    if (!type || (type !== "resume" && type !== "job")) {
      return res.status(400).json({ message: "Invalid video type" });
    }
    
    const videos = await storage.getVideosByType(type, limit, offset);
    res.json(videos);
  });

  app.get("/api/videos/recommended", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const limit = parseInt(req.query.limit as string || "10");
    
    const videos = await storage.recommendVideos(req.session.userId, limit);
    res.json(videos);
  });

  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getVideo(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Increment view count
    await storage.incrementVideoStat(videoId, "views");
    
    res.json(video);
  });

  app.post("/api/videos", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const videoData = insertVideoSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.post("/api/videos/:id/like", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getVideo(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    const updatedVideo = await storage.incrementVideoStat(videoId, "likes");
    res.json(updatedVideo);
  });

  app.post("/api/videos/:id/share", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getVideo(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    const updatedVideo = await storage.incrementVideoStat(videoId, "shares");
    res.json(updatedVideo);
  });

  // Application routes
  app.post("/api/applications", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get the video to find employer ID
      const jobVideoId = req.body.jobVideoId;
      const jobVideo = await storage.getVideo(jobVideoId);
      if (!jobVideo || jobVideo.videoType !== "job") {
        return res.status(400).json({ message: "Invalid job video" });
      }
      
      const employerId = jobVideo.userId;
      
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.session.userId,
        employerId,
      });
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/applications", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let applications;
    if (user.userType === "job_seeker") {
      applications = await storage.getApplicationsByUser(req.session.userId);
    } else {
      applications = await storage.getApplicationsByEmployer(req.session.userId);
    }
    
    res.json(applications);
  });

  app.patch("/api/applications/:id/status", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    try {
      const { status } = z.object({
        status: z.enum(["pending", "viewed", "interview", "rejected", "offered"]),
      }).parse(req.body);
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Only the employer can update the status
      if (application.employerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Comment routes
  app.get("/api/videos/:id/comments", async (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const comments = await storage.getComments(videoId);
    res.json(comments);
  });

  app.post("/api/videos/:id/comments", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        videoId,
        userId: req.session.userId,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const messages = await storage.getConversation(req.session.userId, otherUserId);
    
    // Mark messages as read
    await storage.markMessagesAsRead(otherUserId, req.session.userId);
    
    res.json(messages);
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.session.userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Bookmark routes
  app.get("/api/bookmarks", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const bookmarks = await storage.getBookmarksByUser(req.session.userId);
    res.json(bookmarks);
  });

  app.post("/api/bookmarks", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete("/api/bookmarks/:videoId", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videoId = parseInt(req.params.videoId);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    await storage.deleteBookmark(req.session.userId, videoId);
    res.status(204).end();
  });

  app.get("/api/bookmarks/:videoId", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const videoId = parseInt(req.params.videoId);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const isBookmarked = await storage.isBookmarked(req.session.userId, videoId);
    res.json({ isBookmarked });
  });

  return httpServer;
}
