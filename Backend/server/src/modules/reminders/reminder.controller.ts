import { Request, Response } from "express";
import { getUpcomingRemindersRepo, getTodayRemindersRepo, createReminderRepo, markReminderSentRepo } from "./reminder.repository";

export const getUpcomingRemindersController = async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  const reminders = await getUpcomingRemindersRepo(days);
  res.json({ success: true, data: reminders });
};

export const getTodayRemindersController = async (req: Request, res: Response) => {
  const reminders = await getTodayRemindersRepo();
  res.json({ success: true, data: reminders });
};

export const createReminderController = async (req: Request, res: Response) => {
  const { billId, reminderDate, message, type } = req.body;
  const reminder = await createReminderRepo(billId, reminderDate, message, type);
  res.status(201).json({ success: true, data: reminder });
};

export const markReminderSentController = async (req: Request, res: Response) => {
  const reminder = await markReminderSentRepo(req.params.id as string);
  res.json({ success: true, data: reminder });
};
