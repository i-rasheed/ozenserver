const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const nodemailer = require('../config/nodemailer.config')

router.post("/register", async (req, res) => {
  try {
    let { username, email, password, phonenumber, role } = req.body;

    // validate

    if (!username || !email || !password || !phonenumber)
      return res.status(400).json({ msg: "Not all fields have been entered." });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });

    

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      phonenumber,
      confirmationCode: token,
      role,
    });
    nodemailer.sendConfirmationEmail(
      newUser.username,
      newUser.email,
      newUser.confirmationCode
    );

    const savedUser = await newUser.save();
    res.send({data: savedUser, message: "Registration successfull! Please check your email."});

    
     
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({ message: "Not all fields have been entered." });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    // if (user.status !== "Active") {
    //   return res.status(401).send({
    //     message: "Pending Account. Please Verify Your Email!",
    //   });
    // }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// verify account
router.get("/confirm/:confirmationCode", async (req, res) => {
  try {
    const user = await User.findOne({
      confirmationCode: req.params.confirmationCode,
    })

    if (!user){
      return res.status(404).send({ message: "User Not found." });
    }

    user.status = "Active";
    await user.save() 
    res.status(200).send({message: "Your account is verified! You can now login"})
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    username: user.username,
    id: user._id,
  });
});




module.exports = router;
