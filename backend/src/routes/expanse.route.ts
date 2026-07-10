import { Router } from "express";
import { createItem, updateItem, deleteItem, getItems } from "../controllers/expanse.controller";
import { validate } from "../middleware/validate";
import { expenseSchema, updateExpenseSchema } from "../validators/expanse.validator";
import { uploadimage } from "../middleware/upload";
import { authenticate } from "../middleware/auth";



const router = Router();

router.post("/expense/create", authenticate, ...uploadimage, validate(expenseSchema), createItem);
router.put("/expense/update/:id", authenticate, validate(updateExpenseSchema), updateItem);
// router.delete("/expense/delete/:id", authenticate, deleteItem);
router.get("/expense", authenticate, getItems);

export default router;