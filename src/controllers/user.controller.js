import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

const checkJWTToken = (req, res) => {
  const accessToken = generateAccessToken({ email: "mabdullah2037@gmail.com" });
  const refreshToken = generateRefreshToken({
    email: "mabdullah2037@gmail.com",
  });

  return res.json({
    accessToken,
    refreshToken,
  });
};

const bcryptPassword = (req, res) => {
  bcrypt.hash("testing@123!SMITQUETTA", 12, function (err, hash) {
    return res.json({ password: hash });
  });
};

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });

  try {
    const user = await User.findOne({ email: email });
    if (user) return res.status(401).json({ message: "user already exist" });

    const createUser = await User.create({
      email,
      password,
    });
    res.json({ message: "user registered successfully", data: createUser });
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "email required" });
    if (!password) return res.status(400).json({ message: "password required" });
    // email mujood ha bhi ya nahi ha
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "no user found" });
    // password compare krwayenga bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "incorrect password" });

    // token generate
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // cookies
    res.cookie("refreshToken", refreshToken, { http: true, secure: false });

    res.json({
      message: "user loggedIn successfully",
      accessToken,
      refreshToken,
      data: user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error during login", error: error.message });
  }
};

// logout user
const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "user logout successfully" });
};

// refreshtoken
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });

  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

  const user = await User.findOne({ email: decodedToken.email });

  if (!user) return res.status(404).json({ message: "invalid token" });

  const generateToken = generateAccessToken(user);
  res.json({ message: "access token generated", accesstoken: generateToken });

  res.json({ decodedToken });
};


// authenticate user middleware
const authenticateUser = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(404).json({ message: "no token found" });

  jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "invalid token" });
    req.user = user;
    next();
  });
};


export { bcryptPassword, checkJWTToken, registerUser, loginUser, logoutUser, refreshToken , authenticateUser };
