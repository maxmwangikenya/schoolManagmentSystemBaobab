import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fix: Corrected 'awit' to 'await' and 'user' to 'User' (model name)
    const user = await User.findOne({ email });
    
    if (!user) {
      // Changed status code from 404 to 401 for unauthorized
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Fix: Corrected 'constisMatch' to 'const isMatch' and 'wrote passwprd' typo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Wrong password" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    // Fix: Corrected 'sucess' to 'success'
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error.message);
    // Added error response to client
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export { login };