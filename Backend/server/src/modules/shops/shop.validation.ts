import { body } from "express-validator";

export const createShopValidation = [

  body("shopName")
    .trim()
    .notEmpty()
    .withMessage("Shop name required"),


  body("paymentTerm")
    .optional()
    .isInt({ min: 1, max: 365 }),

  body("creditLimit")
    .optional()
    .isFloat({ min: 0 }),

];