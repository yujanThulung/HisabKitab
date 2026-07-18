import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createSettlement, getSettlementPreview, getSettlemets } from "../controllers/settlement.controller";

const router = Router();

router.post("/settlement/create", authenticate, createSettlement);
router.get("/settlement/preview", authenticate, getSettlementPreview);
router.get("/settlement", authenticate, getSettlemets);

export default router;