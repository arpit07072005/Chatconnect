import { Router } from "express"
import { getUser, userLogin, userLogout, userRegister } from "../controller/user.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router =Router();

router.route("/register").post(upload.single("image"),userRegister);
router.route("/login").post(userLogin);
router.route("/").get(verifyjwt,getUser);
router.route("/logout").post(verifyjwt,userLogout);

export default router