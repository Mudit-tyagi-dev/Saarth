import * as authService from "../services/auth.service.js";

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signupUser({ name, email, password });
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return res.json({
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.userId);
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile",
    });
  }
}
