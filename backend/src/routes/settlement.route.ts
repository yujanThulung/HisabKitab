import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createSettlement, getSettlemets } from "../controllers/settlement.controller";

const router = Router();

router.post("/settlement/create", authenticate, createSettlement);
router.get("/settlement", getSettlemets);

export default router;