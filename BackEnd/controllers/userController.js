const UserModel = require("../model/userModel");
const BookingModel = require("../model/bookingModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { redisCacheCall } = require("../utils/redisCalls");

//Signup user
exports.signupUser = async (req, res) => {
  let { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  if (role !== "Admin") {
    role = "notAdmin";
  }

  const userId = `USER#${email}`; //creating user Id

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userData = {
    PK: userId,
    SK: "METADATA",
    Entity: "USER",
    UserId: userId,
    Name: name,
    Email: email,
    Phone: phone,
    Password: hashedPassword,
    Bookings: [],
    Role: role,
  };

  try {
    await UserModel.createUser(userData);
    // Invalidate Redis cache for users
    await redisCacheCall("del", userId);
    return res
      .status(201)
      .json({ userId, message: "User Created Successfully" });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }
    console.error("Error querying DynamoDB (createUser):", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
      errorDetails: error.message,
    });
  }
};

//login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are both required." });
    }

    // Check Redis cache first
    let user = await redisCacheCall("get", `user:USER#${email}`);
    if (!user) {
      // Fetch user by email from DB if not cached
      const userResponse = await UserModel.loginUser(email);
      if (!userResponse.success) {
        return res
          .status(userResponse.statusCode)
          .json({ message: userResponse.message });
      }
      user = userResponse.data;

      // Cache the user in Redis for 10 minutes
      await redisCacheCall("set", `user:${email}`, 600, user);
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.UserId,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      userId: user.UserId,
      name: user.Name,
      email: user.Email,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Unable to log in." });
  }
};

//fetch user
exports.fetchUser = async (req, res) => {
  const userId = "USER#" + req.params.userId;
  const JwtUserId = req.user.id;

  if (userId !== JwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  try {
    // Check Redis cache first
    let data = await redisCacheCall("get", `user:${userId}`);
    if (!data) {
      console.log("Fetch DB call is made....");
      // Fetch user from DB if not cached
      data = await UserModel.getUser(userId);
      if (!data) return res.status(404).json({ message: "User not found" });

      // Cache the user in Redis for 10 minutes
      await redisCacheCall("set", `user:${userId}`, 600, data);
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log("Error in fetching user", err);
    return res.status(500).json({ message: "Error fetching user" });
  }
};

//update User
exports.updateUser = async (req, res) => {
  const userId = "USER#" + req.params.userId;
  const { name, phone, password } = req.body;

  if (!name && !phone && !password) {
    return res.status(406).json({ message: "Empty Request." });
  }

  const JwtUserId = req.user.id;

  if (userId !== JwtUserId) {
    return res.status(403).json({ message: "Different UserId is used." });
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (name) {
    updateExpression.push("#name = :name");
    expressionAttributeValues[":name"] = name;
    expressionAttributeNames["#name"] = "name";
  }
  if (phone) {
    updateExpression.push("Phone = :phone");
    expressionAttributeValues[":phone"] = phone;
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateExpression.push("Password = :password");
    expressionAttributeValues[":password"] = hashedPassword;
  }

  try {
    await UserModel.updateUser(
      userId,
      `SET ${updateExpression.join(", ")}`,
      expressionAttributeValues,
      expressionAttributeNames
    );

    // Invalidate Redis cache for the user
    await redisCacheCall("del", `user:${userId}`);
    return res.status(200).json({ message: "User Updated Successfully" });
  } catch (err) {
    console.log("Error in updating user ", err);
    return res.status(500).json({ message: "Error updating user" });
  }
};

//delete User
exports.deleteUser = async (req, res) => {
  let { userId } = req.params;
  userId = "USER#" + userId;

  const currentTime = Math.floor(Date.now() / 1000);
  const JwtUserId = req.user.id;

  if (userId !== JwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  try {
    const bookings = await BookingModel.getUpcomingBookings(
      userId,
      currentTime.toString()
    );

    if (bookings.length > 0) {
      return res.status(404).json({
        message: "You have upcoming bookings, cannot delete account.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching bookings by time" });
  }

  try {
    const userData = await UserModel.getUser(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    const bookings = userData.bookings || [];
    bookings.map(async (bookingId) => {
      await UserModel.deleteAllBookings(userId, bookingId);
    });

    await UserModel.deleteUser(userId);

    // Invalidate Redis cache for the user
    await redisCacheCall("del", `user:${userId}`);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error in deleting user ", err);
    return res.status(500).json({ message: "Error in deleting user" });
  }
};
