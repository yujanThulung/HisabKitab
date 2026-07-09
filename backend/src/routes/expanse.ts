import { Router } from "express";
import { createItem, updateItem } from "../controllers/expanse.controller";
import { validate } from "../middleware/validate";
import { expenseSchema, updateExpenseSchema } from "../validators/expanse.validator";
import { uploadimage } from "../middleware/upload";
import { authenticate } from "../middleware/auth";



const router = Router();

router.post("/expanse/create", authenticate, ...uploadimage, validate(expenseSchema), createItem);
router.put("/expanse/update/:id", authenticate, validate(updateExpenseSchema), updateItem);

export default router;