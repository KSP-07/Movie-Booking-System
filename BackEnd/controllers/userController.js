const UserModel = require("../model/userModel");
const BookingModel = require("../model/bookingModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

  // Check if the user already exists in the database
  // try {
  //   const existingUser = await UserModel.getUser(userId); //this check will fail in case of eventual consistency. so I have also used ConditionalExpression to ensure consistency.
  //   if (existingUser) {
  //     return res.status(409).json({ message: "User already exists." });
  //   }
  // } catch (err) {
  //   console.log("Error checking if user exists", err);
  //   return res.status(500).json({ message: "Error checking if user exists." });
  // }

  //hashing password
  const saltRounds = 10;
  hashedPassword = await bcrypt.hash(password, saltRounds);
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
    // console.log('inside controller -------',userData);
    await UserModel.createUser(userData);
    // console.log('---------results ',result);
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
    // Handle other errors
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

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are both required." });
    }

    // Fetch user by email
    const userResponse = await UserModel.loginUser(email);

    // Handle user response
    if (!userResponse.success) {
      return res.status(userResponse.statusCode).json({
        message: userResponse.message,
      });
    }

    const user = userResponse.data;

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.UserId,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response with token
    return res.status(200).json({
      message: "Login successful.",
      userId: user.UserId,
      name: user.Name,
      email: user.Email,
      token: `Bearer ${token}`, // Standard Bearer token format
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({
      message: "Internal server error. Unable to log in.",
    });
  }
};

//fetch user
exports.fetchUser = async (req, res) => {
  const userId = "USER#" + req.params.userId; //since # in userid will create problems, therefore just asing user emai in id and adding "user#"
  // console.log('++----' , userId);
  const JwtUserId = req.user.id; //extracting userId from token to verify with the userId passed in the params.

  if (userId !== JwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }
  try {
    const data = await UserModel.getUser(userId);
    // console.log(data,'---------------')
    if (!data) return res.status(404).json({ message: "User not found" });
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

  const JwtUserId = req.user.id; //extracting userId from token to verify with the userId passed in the params.

  if (userId !== JwtUserId) {
    return res.status(403).json({ message: "Different UserId is used." });
  }
  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  if (name) {
    // updateExpression.push("Name = :name");
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
    return res.status(200).json({ message: "User Updated Successfully" });
  } catch (err) {
    console.log("Error in updating user ", err);
    return res.status(500).json({ message: "Error updating user" });
  }
};

//delete User
exports.deleteUser = async (req, res) => {
  // const userId = req.params.userId;

  let { userId } = req.params;
  userId = "USER#" + userId;

  // const status = 'confirmed';

  const currentTime = Math.floor(Date.now() / 1000); //converting time to epoch time

  const JwtUserId = req.user.id; //extracting userId from token to verify with the userId passed in the params.

  if (userId !== JwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  try {
    // console.log('curre' , currentTime.toString());
    const bookings = await BookingModel.getUpcomingBookings(
      userId,
      currentTime.toString()
    );
    // console.log('-=-=-=-=-',bookings , userId);
    if (bookings.length > 0) {
      return res
        .status(404)
        .json({ message: "You have upcoming bookings, can not delte account" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching bookings by time" });
  }

  try {
    // Fetch User Details to get bookings

    const userData = await UserModel.getUser(userId);

    if (!userData.Item) {
      return res.status(404).json({ message: "User not found." });
    }

    const bookings = userData.Item.bookings || [];

    // Delete All Bookings
    bookings.map(async (bookingId) => {
      await UserModel.deleteAllBookings(userId, bookingId);
    });

    //Delete user
    await UserModel.deleteUser(userId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log("Error in deleting user ", err);
    return res.status(500).json({ message: "Error in deleting user" });
  }
};
