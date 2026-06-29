import { Request, Response } from "express";
import prisma from "../../config/prisma";
import argon2 from "argon2";

// ─── GET CURRENT USER ─────────────────────────────
export const getMeController = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ success: true, data: user });
};

// ─── GET ALL USERS (Admin only) ───────────────────
export const getUsersController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: users });
};

// ─── CREATE USER (Admin only) ──────────────────────
export const createUserController = async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;
  const hashed = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.status(201).json({ success: true, message: "User created", data: user });
};

// ─── DELETE USER (Admin only) ──────────────────────
export const deleteUserController = async (req: Request, res: Response) => {
const id = req.params.id as string;
const user = await prisma.user.findUnique({ where: { id } });

  // Admin khud ko delete na kar sake
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: "You cannot delete yourself" });
  }
  // User exist karta hai ya nahi check kar
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: "User deleted successfully" });
};

// ─── UPDATE USER (Admin only) ──────────────────────
export const updateUserController = async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const { name, email, phone, role, isActive } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { name, email, phone, role, isActive },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
  });

  res.json({ success: true, message: "User updated successfully", data: updated });
};

// ─── ADMIN: RESET ANY USER'S PASSWORD ──────────────
export const resetUserPasswordController = async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const hashed = await argon2.hash(newPassword);
  await prisma.user.update({
    where: { id },
    data: { password: hashed },
  });

  res.json({ success: true, message: "Password reset successfully" });
};

// ─── ADMIN: UPDATE OWN PASSWORD ────────────────────
export const updateOwnPasswordController = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password (min 6 chars) required",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Current password verify karo
  const isMatch = await argon2.verify(user.password, currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  const hashed = await argon2.hash(newPassword);
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashed },
  });

  res.json({ success: true, message: "Password updated successfully" });
};