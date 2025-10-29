// server/routes/departmentRoutes.js
import { Router } from "express";
import { verifyUser, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  archiveDepartment,
  restoreDepartment,
  activateDepartment,
  deactivateDepartment
} from "../controllers/departmentController.js";

const router = Router();

// CRUD + search/pagination
router.post("/", verifyUser, adminMiddleware, createDepartment);
router.get("/", verifyUser, listDepartments);
router.get("/:id", verifyUser, getDepartment);
router.put("/:id", verifyUser, adminMiddleware, updateDepartment);
router.patch("/:id", verifyUser, adminMiddleware, updateDepartment);

// Lifecycle
router.post("/:id/archive", verifyUser, adminMiddleware, archiveDepartment);
router.post("/:id/restore", verifyUser, adminMiddleware, restoreDepartment);
router.post("/:id/activate", verifyUser, adminMiddleware, activateDepartment);
router.post("/:id/deactivate", verifyUser, adminMiddleware, deactivateDepartment);

export default router;
