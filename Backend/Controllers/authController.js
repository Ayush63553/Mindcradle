import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};
export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;
  try {
    let user = null;
    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }
    if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User Successfully Created" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = null;
//     const patient = await User.findOne({ email });
//     const doctor = await Doctor.findOne({ email });

//     if (patient) user = patient;
//     else if (doctor) user = doctor;

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User Not Found" });
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.password);

//     if (!isPasswordMatch) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Credentials" });
//     }

//     const token = generateToken(user);
//     const { password: _, role, appointments, ...rest } = user._doc;

//     return res
//       .status(200)
//       .json({
//         success: true,
//         message: "Successfully Logged In",
//         token,
//         data: { ...rest },
//         role,
//       });
//   } catch (err) {
//     console.error("Login Error:", err); // Add detailed log for troubleshooting
//     res
//       .status(500)
//       .json({ success: false, message: "Server Error: Failed to Login" });
//   }
// };

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    let user = null;
    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Credentials" });
    }

    const token = generateToken(user);
    const { password, role, appointments, ...rest } = user._doc;

    res.status(200).json({
      status: true,
      message: "Successfully Login",
      token,
      data: { ...rest },
      role,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to Login" });
  }
};

// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // const validuser = await User.findOne({ email });

//     let validuser = null;
//     const patient = await User.findOne({ email });
//     const doctor = await Doctor.findOne({ email });

//     if (patient) {
//       validuser = patient;
//     }
//     if (doctor) {
//       validuser = doctor;
//     }
//     if (!validuser) {
//       return next(errorhandler(404, "Invalid User"));
//     }
//     const validpassword = bcryptjs.compareSync(password, validuser.password);
//     if (!validpassword) {
//       return next(errorhandler(406, "Incorrect Credentials"));
//     }

//     const token = jwt.sign({ id: validuser._id }, process.env.jwt_secret);
//     const { password: pass, ...rest } = validuser._doc;

//     res
//       .cookie("access_token", token, { httpOnly: true })
//       .status(200)
//       .json(rest);
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to Login" });
//   }
// };
