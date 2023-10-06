import express from "express";
import {
  changeUserPassword,
  loggedUser,
  sendUserPasswordResetEmail,
  userLogin,
  userPasswordReset,
  userRegistration,
} from "../controllers/userController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
const router = express.Router();

//route level middleware to protect route
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

//Public Routes
router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/send-reset-password-email", sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);

//Protected Routes
router.post("/changepassword", changeUserPassword);
router.get("/loggeduser", loggedUser);

export default router;
