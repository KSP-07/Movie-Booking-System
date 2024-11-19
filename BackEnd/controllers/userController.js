const UserModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Signup user
exports.signupUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const userId = `USER#${Date.now()}`; //creating user Id
  const userData = {
    PK: userId,
    SK: "METADATA",
    Entity: "USER",
    UserId: userId,
    Name: name,
    Email: email,
    Phone: phone,
    Password: password,
    Bookings: [],
  };

  try {
    await UserModel.createUser(userData);
    res.status(201).json({ userID, message: "User Created Successfully" });
  } catch (err) {
    console.log("Error in creating user", err);
    res.status(500).json({ message: "Error creating user" });
  }
};

//login User

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password both are required" });
    }

    //fetch user by email
    const user = await UserModel.loginUser(email);
    if (!user) {
      return res.status(404).josn({ message: "User Not found" });
    }

    //compare passwords
    const isPasswordValid = await brcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    //generate a session token or return a success response
    // Generate JWT
    const token = jwt.sign(token, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Login Successful",
      userId: user.userId,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//fetch user
exports.fetchUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const data = await UserModel.getUser(userId);
    if (!data.item) return res.status(404).json({ message: "User not found" });
    res.status(200).json(data.item);
  } catch (err) {
    console.log("Error in fetching user", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

//update User
exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { name, phone } = req.body;

  const updateExpression = [];
  const expressionAttributeValues = {};

  try {
    await UserModel.updateUser(
      userId,
      `SET ${updateExpression.join(", ")}`,
      expressionAttributeValues
    );
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (err) {
    console.log("Error in updating user ", err);
    res.status(500).json({ message: "Error updating user" });
  }
};

//delete User
exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    await UserModel.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error in deleting user ", err);
    res.status(500).json({ message: "Error in deleting user" });
  }
};
