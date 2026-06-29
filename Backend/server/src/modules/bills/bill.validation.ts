import { body } from "express-validator";

export const createBillValidation = [
  body("shopId").notEmpty().withMessage("Shop required"),
  body("amount").isFloat({ min: 1 }).withMessage("Valid amount required"),
  body("billDate").isISO8601().withMessage("Valid bill date required"),
  body("dueDate").isISO8601().withMessage("Valid due date required"),
];
