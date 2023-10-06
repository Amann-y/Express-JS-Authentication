import { UserModel } from "../models/UsersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

const userRegistration = async (req, res) => {
  try {
    const { name, password, email, password_confirmation, tc } = req.body;
    if (!name || !password || !email || !password_confirmation || !tc) {
      return res.send({
        status: "failed",
        message: "Please Provide All The Fields",
      });
    } else {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        return res.send({ status: "failed", message: "Email Already Exist" });
      } else {
        if (password === password_confirmation) {
          const hashedPassword = await bcrypt.hash(
            password,
            10,
            async function (err, hash) {
              const doc = new UserModel({
                name: name,
                password: hash,
                email: email,
                tc: tc,
              });
              const newUser = await doc.save();
              const savedUser = await UserModel.findOne({ email: email });
              const token = jwt.sign(
                { userID: savedUser._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1d" }
              );
              res.send({
                status: "success",
                message: "User Has Been Registered Successfully",
                token: token,
              });
            }
          );
        } else {
          return res.send({
            status: "failed",
            message: "Password And Confirm Password Don't Match",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({ status: "failed", message: "All Fields Are Required" });
    } else {
      const user = await UserModel.findOne({ email: email });
      if (!user || user == null) {
        return res.send({
          status: "failed",
          message: "You Are Not A Registered User",
        });
      } else {
        await bcrypt.compare(
          password,
          user.password,
          async function (err, result) {
            if (result && email === user.email) {
              const savedUser = await UserModel.findOne({ email: email });
              const token = jwt.sign(
                { userID: savedUser._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1d" }
              );
              return res.send({
                status: "success",
                message: "Login Successfully",
                token: token,
              });
            } else {
              return res.send({
                status: "failed",
                message: "Credentials Don't Match",
              });
            }
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { password, password_confirmation } = req.body;
    if (!password || !password_confirmation) {
      return res.send({ status: "failed", message: "All Fields Are Required" });
    } else {
      if (password === password_confirmation) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: hashedPassword },
        });
        return res.send({
          status: "success",
          message: "Password Changed Successfully",
        });
      } else {
        return res.send({
          status: "failed",
          message: "Credentials Don't Match",
        });
      }
    }
  } catch (error) {}
};

const loggedUser = async (req, res) => {
  try {
    res.send({ user: req.user });
  } catch (error) {
    console.log(error);
  }
};

const sendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || email == null || email == undefined) {
      return res.send({ status: "failed", message: "Email Is Required" });
    } else {
      const user = await UserModel.findOne({ email: email });

      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

        // Send Email
        // let info = await transporter.sendMail({
        //   from: process.env.EMAIL_FROM,
        //   to: user.email,
        //   subject: "Password Reset Link",
        //   html: `<a href=${link}>Click Here</a> To Reset Your Password`,
        // });
        return res.send({
          status: "success",
          message: "Password Reset Link Has Been Sent, Please Check Your Email",
          // info: info,
        });
      } else {
        return res.send({ status: "failed", message: "Email Doesn't Exist" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;

  const user = await UserModel.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && password_confirmation) {
      if (password === password_confirmation) {
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(user._id, {
          $set: { password: newHashedPassword },
        });
        return res.send({
          status: "success",
          message: "Password Has Been Reset Successfully",
        });
      } else {
        return res.send({
          status: "failed",
          message: "Credentials Don't Match",
        });
      }
    } else {
      return res.send({ status: "failed", message: "All Fields Are Required" });
    }
  } catch (error) {
    console.log(error);
  }
};

export {
  userRegistration,
  userLogin,
  changeUserPassword,
  loggedUser,
  sendUserPasswordResetEmail,
  userPasswordReset,
};
