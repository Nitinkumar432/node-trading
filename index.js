const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const app = express();
const UserProfile=require('./models/userprofile.js');
const Register = require('./models/register.js');
const SECRET_KEY = 'xyxxx'; // Replace with your actual secret key
const port = 3000;
const uri = process.env.MONGO_URL;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To parse JSON data
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log(chalk.white(`\nConnected to MongoDB successfully!\n`)))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  // Skip token verification for the /login route
  if (req.path === '/login') {
    return next();
  }

  const token = req.cookies.authToken; // Assuming token is stored in cookies

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    try {
      // Fetch the user data from the database
      const user = await Register.findById(decoded.id);
      if (!user) {
        return res.redirect('/login');
      }
      req.user = user; // Store the user data in the request object
      next();
    } catch (error) {
      console.error(error);
      return res.redirect('/login');
    }
  });
};

// Middleware to restrict access for logged-in users
const restrictAccess = (req, res, next) => {
  const token = req.cookies.authToken;

  if (token) {
    // Check if the token is valid
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (!err) {
        // Redirect to home if the token is valid
        return res.redirect('/home');
      }
    });
  }
  next(); // Only call next() if there is no valid token
};

// Route to the login page
app.get('/login', restrictAccess, (req, res) => {
  console.log("login page accessed");
  res.render('login');
});

// Home route
app.get('/', verifyToken, (req, res) => {
  console.log("home page accessed");
  res.render('home', { user: req.user });
});

// Home route
app.get('/home', verifyToken, (req, res) => {
  res.render('home', { user: req.user }); // Pass the user data to the home page
});

app.get('/profile', verifyToken,async (req, res) => {
  const userdata=await UserProfile.findOne({email:req.user.email});
  res.render('profile', { user: req.user,userdata });
});
app.get('/userdata',(req,res)=>{
  res.render('userdata',{user:req.user});
})
function generateRandomDematAccountNumber() {
  return Math.floor(Math.random() * 10000000000).toString(); // Generates a random 10-digit number
}

function generateRandomDpId() {
  return Math.floor(Math.random() * 10000000).toString(); // Generates a random 7-digit number
}

function generateRandomDepositoryParticipant() {
  const participants = ['Tradehub Limited', 'Zerodha', 'Upstox', 'ICICI Direct', 'HDFC Securities'];
  return participants[Math.floor(Math.random() * participants.length)]; // Randomly selects a participant
}

function generateRandomDepository() {
  const depositories = ['CDSL', 'NSDL'];
  return depositories[Math.floor(Math.random() * depositories.length)]; // Randomly selects a depository
}
app.post('/submit', async (req, res) => {
  console.log(req.body);

  try {
      // Generate random data
      const randomDematAccountNumber = generateRandomDematAccountNumber();
      const randomDpId = generateRandomDpId();
      const randomDepositoryParticipant = generateRandomDepositoryParticipant();
      const randomDepository = generateRandomDepository();

      // Create a new user profile with the provided data and generated random data
      const userProfile = new UserProfile({
          ...req.body, // Spread the incoming request body
          dematAccountNumber: randomDematAccountNumber,
          dpId: randomDpId,
          depositoryParticipant: randomDepositoryParticipant,
          depository: randomDepository,
      });

      console.log(userProfile); // Log the userProfile to see the generated data
      await userProfile.save(); // Save the user profile to the database
      res.status(200).json({ message: 'Your request has been accepted.', success: true });
  } catch (error) {
      console.error('Error saving user profile:', error);
      res.status(500).json({ message: 'There was an error processing your request.', success: false });
  }
});

// Handle login POST request
app.post('/login', restrictAccess, async (req, res) => {
  console.log("login request page accessed");
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Register.findOne({ email });

    if (!user || password !== user.password) {
      return res.render('login', { error: 'Email or password is incorrect.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

    // Set the token in cookies
    res.cookie('authToken', token, { httpOnly: true });

    // Redirect to home page with user data on successful login
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Something went wrong. Please try again!' });
  }
});
// logout
app.get('/logout',(req,res)=>{
  res.clearCookie('authToken');
  console.log("logout successfully");
});
// Route to the register page
app.get('/register', restrictAccess, (req, res) => {
  console.log("register request page accessed");
  res.render('register', { error: null });
});

// Handle register POST request
app.post('/register', restrictAccess, async (req, res) => {
  const { name, email, phoneNumber, dob, password, confirmPassword } = req.body;

  if (!name || !email || !phoneNumber || !dob || !password || !confirmPassword) {
    return res.render('register', { error: 'All fields are required!' });
  }

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match!' });
  }

  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters long!' });
  }

  try {
    const existingUser = await Register.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.render('register', { error: 'Email or Phone Number already in use!' });
    }

    const newUser = new Register({ name, email, phoneNumber, dob, password });
    await newUser.save();

    res.render('registersuccess');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong. Please try again!' });
  }
});

// Route to verify email
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found!' });
    }
    // If email exists, send a success response
    res.status(200).json({ message: 'Email found!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});

// Route to verify OTP and update password
app.post('/verify-otp', async (req, res) => {
  const { email, newPassword } = req.body;

  // Update the user's password in the database
  try {
    await Register.updateOne({ email }, { password: newPassword });
    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});
app.get('/update',async (req,res)=>{

  
  await UserProfile.updateOne({email:"swastiomil@gmail.com"},{isVerified:"rejected"});
  res.send("request accepted");

})
// verify account section
app.get('/verify_account', verifyToken, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.userType !== 'admin') {
      return res.status(403).send('Access denied: You are not authorized to view this page.');
    }

    // Fetch all user profiles from the database
    const userProfiles = await UserProfile.find();

    // Separate user profiles into unverified, verified, and rejected
    const unverifiedProfiles = userProfiles.filter(profile => profile.isVerified === 'false');
    const verifiedProfiles = userProfiles.filter(profile => profile.isVerified === 'true');
    const rejectedProfiles = userProfiles.filter(profile => profile.isVerified === 'rejected');

    // Render the verify_account.ejs view with the userProfiles data
    res.render('verify_account.ejs', { user: req.user, unverifiedProfiles, verifiedProfiles, rejectedProfiles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
app.post('/reject/:id', async (req, res) => {
  try {
    const { reason } = req.body; // Get the reason from the request body
    const updatedProfile = await UserProfile.findByIdAndUpdate(req.params.id, {
      isVerified: 'rejected', // Update the verification status
      reason: reason, // Store the rejection reason
      verified_by: null, // Clear verified_by since the user is rejected
    }, { new: true });

    if (!updatedProfile) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('User rejected successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
app.get('/verifyed',async (req,res)=>{
  await UserProfile.updateMany({isVerified:'true'},{isVerified:'false'});
  res.send("changed");
  console.log("done");

});
app.post('/verify/:id', async (req, res) => {
  try {
    const updatedProfile = await UserProfile.findByIdAndUpdate(req.params.id, {
      isVerified: 'true',
      verified_by: req.body.verifiedBy,
    }, { new: true });

    if (!updatedProfile) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('User verified successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// user profile
app.get('/user_profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserProfile.findById(userId); // Adjust according to your database query method

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user data to send
    const userData = {
      name: user.name,
      email: user.email,
      dematAccountNumber: user.dematAccountNumber,
      dpId: user.dpId,
      depositoryParticipant: user.depositoryParticipant,
      depository: user.depository,
      aadharNumber: user.aadharNumber,
      pancard: user.pancard,
      phoneNumber: user.phoneNumber,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      branch: user.branch,
      nominees: user.nominees,
      kycCopyUrl: user.kycCopyUrl || 'N/A'
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Start server
app.listen(port, () => {
  console.log(
    chalk.bgGreen.white(`\n\n  Server is running on port ${port}  \n`) +
    chalk.blue(`  Visit: http://localhost:${port}  \n`) +
    chalk.yellow(`  Enjoy your coding journey!  \n`) +
    chalk.red(`  Don't forget to take breaks!  \n\n`)
  );
});