import jwt from "jsonwebtoken";
import { UserModel } from "../models/UsersModel.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  try {
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get user from token

      req.user = await UserModel.findById(userID).select("-password");
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ status: "failed", message: "Unauthorized User" });
  }

  if (!token) {
    res
      .status(401)
      .send({ status: "failed", message: "Unauthorized User, No Token" });
  }
};

export { checkUserAuth };
