import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getUpcomingRemindersController, getTodayRemindersController, createReminderController, markReminderSentController } from "./reminder.controller";

const router = Router();
router.use(authenticate);

router.get("/upcoming", getUpcomingRemindersController);
router.get("/today", getTodayRemindersController);
router.post("/", createReminderController);
router.patch("/:id/sent", markReminderSentController);

export default router;
