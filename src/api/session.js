/* As a new user, I want to register to the application using username and password. */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Router } = require('express');
const router = Router();
const { sqlite } = require('../api/sources');

// ============================================================================
// ** Sign Up
router.post("/signup", async (req, res) => {
  // check if user is already exist
  const userFound = await checkUser(req.body.username);
  if (userFound){
    console.log(`The user already exist.`);
    const message = {
      message: "This user already exist."
    }
    res.status(409).send(message);
    return;
  }
  
  // hashing password
  const salt = await bcrypt.genSalt(10);
  const pwdHashed = await bcrypt.hash(req.body.password, salt);

  // create new user
  // const newUser = await mongodb.createUser(req.body.username, pwdHashed);
  const newUser = sqlite.insertUser(req.body.username, pwdHashed);

  // send result / error 
  if (newUser){
    res.status(201).send("Sign up OK, please login.");
  } else{
    const message = {
      message: "Something error during user creation"
    }
    res.status(400).send(message);
  }
});

// ============================================================================
// ** Sign In
router.post("/signin", async (req, res) => {
  // get user and check password
  // const userFound = await mongodb.getUser(req.body.username);
  const userFound = sqlite.selectUserByName(req.body.username);
  const validPassword = await bcrypt.compare(req.body.password, userFound.HashedPassword);
  
  // if bad password send error
  if (!validPassword){
    const message = {
      message: "Invalid user or password"
    }
    res.status(400).send(message);
    return;
  }
  
  // create token and send it
  console.log(userFound.Username);
  const token = {
    access_token: jwt.sign({ userId: userFound.UserId, user: userFound.Username }, process.env.JWTKEY)
  }
  res.send(token);  
});

// ============================================================================
// ** check user
async function checkUser(username){
  // const userFound = await mongodb.getUser(username);
  const userFound = sqlite.selectUserByName(username);
  return (userFound) ? true : false;
}

module.exports = router;
