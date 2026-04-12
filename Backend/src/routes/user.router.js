import { Router } from "express"
import { getUser, userLogin, userLogout, userRegister } from "../controller/user.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";


const router =Router();

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/").get(verifyjwt,getUser);
router.route("/logout").post(verifyjwt,userLogout);

export default router