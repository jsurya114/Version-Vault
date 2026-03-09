import { Router } from "express";
import { container } from "tsyringe";
import { AdminUserController } from "../../controllers/admin/AdminUserController";

const router = Router()
const adminUserController = container.resolve(AdminUserController)

router.get('/users',(req,res,next)=>adminUserController.getAllUsers(req,res,next))
export default router