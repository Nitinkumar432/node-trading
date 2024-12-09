const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const PDFDocument = require('pdfkit');
const Razorpay = require("razorpay");
const Coupon=require('./models/coupon.js');
const Putoken = require('./models/putcoupon');
const nodemailer=require("nodemailer");
const request = require('request');
const geoip = require('geoip-lite');
const GoldInvestment = require('./models/goldschema.js');
const UserInvestment = require('./models/userinvestingold.js');
const SensexSchema =require('./models/sensexschema.js');
const NiftySchema=require('./models/niftyschema.js');
const axios = require('axios');


// gogole genrative ai
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

require('dotenv').config();
const Ipo=require('./models/Ipo.js');
const otpMap = new Map();
const Booking=require('./models/user_ipo.js');
MutualFund=require('./models/mutulfund.js');
const fundst=require('./models/fundst.js');
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const app = express();
const createEmailTemplate=require('./page/fundsmail.js');
const UserProfile=require('./models/userprofile.js');
const Register = require('./models/register.js');
const Help = require('./models/help.js');
const SECRET_KEY = 'xyxxx'; // Replace with your actual secret key
const port = 3000;
const Stock=require('./models/stock.js');
const userstock=require("./models/userstocks.js");
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

// Help page route
app.get('/help', verifyToken, async (req, res) => {
  try {
    // Find queries related to the logged-in user
    const userEmail = req.user.email; // Assuming req.user contains the logged-in user's info
    const pendingQueries = await Help.find({ email: userEmail, query_resolved: 'No' });
    const resolvedQueries = await Help.find({ email: userEmail, query_resolved: 'Yes' });

    res.render('help.ejs', {
      pendingQueries,
      resolvedQueries,
      message: null,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get("/delete",async (req,res)=>{
 
  await Help.deleteMany({});
  res.send("deletedd");
})

// Query route
// app.get('/date/:email',async (req,res)=>{
//   const x=req.params.email;

//   const xt=await Register.findOne({email:x});
//   if(!xt){
//     res.send("not found")
//   }

//   res.send(xt);

//   console.log(x);
// });
app.post('/submit-query', verifyToken, async (req, res) => {
  const { name, email, query } = req.body;

  try {
      // Create a new query document
      const newQuery = new Help({ name, email, query });
      // Save the document to the database
      await newQuery.save();
      console.log('Query saved to the database');

      // Render the help page with a success message
      res.send(`<html>
                <head>
                    <title>Success</title>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #f8f9fa;
                        }
                        .success-message {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-message">
                        <h2>Your query has been submitted successfully!</h2>
                        <p>You will be redirected in a moment...</p>
                    </div>
                    <script>
                        setTimeout(function() {
                            window.location.href = '/help'; // Redirect to the help query page
                        }, 2000); // 2 seconds delay
                    </script>
                </body>
            </html>
        `);
      // res.render('help', { message: 'Query submitted successfully. We\'ll get back to you on this!', user: req.user });
  } catch (error) {
      console.error('Error saving query:', error);
      // Render the help page with an error message
      // r
      res.send("there is problem to sending your quer");
  }
});

// app.get('/data',async (req,res)=>{
//    const x = await Help.find({});
//    console.log(x);
// });

// Home route
app.get('/', verifyToken, (req, res) => {
  console.log("home page accessed");
  res.render('home', { user: req.user });
});

// Home route
app.get('/home', verifyToken, (req, res) => {
  res.render('home', { user: req.user }); // Pass the user data to the home page
});

app.get('/profile', verifyToken, async (req, res) => {
  try {
    const userdata = await UserProfile.findOne({ email: req.user.email });
    console.log(userdata);
    
    // Check if userdata exists or profile details are incomplete
    if (!userdata ) {
      // If user data does not exist or is not verified, ask the user to fill in details
      return res.render('profile', { user: req.user, userdata: null });
    }
  
    // If user data is available and profile is verified
    res.render('profile', { user: req.user, userdata });
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    res.status(500).send("Server Error");
  }
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
app.get('/update',async (req,res)=>{
await Register.updateOne({email:"nitinraj844126@gmail.com"},{userType:"admin"});
res.send("ok");
})
app.post('/login', restrictAccess, async (req, res) => {
  console.log("login request page accessed");
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Register.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.render("wrongpassword.ejs", { username: 'Invalid email or password.' });
    }

    // Check if the account is locked
    const currentTime = Date.now();
    if (user.lockUntil && currentTime < user.lockUntil) {
      const remainingTime = Math.ceil((user.lockUntil - currentTime) / (1000 * 60)); // Remaining time in minutes
      return res.render("wrongpassword.ejs", {
        username: `Account locked. Try again in ${remainingTime} minutes.`,
      });
    }

    // Validate password
    if (password !== user.password) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;

      // Lock account if failed attempts exceed the threshold (e.g., 3)
      if (user.failedAttempts >= 3) {
        user.lockUntil = currentTime + 60 * 60 * 1000; // Lock for 1 hour
        await user.save();
        return res.render("wrongpassword.ejs", {
          username: `Too many failed attempts. Your account is locked. Try again in 60 minutes.`,
        });
      }

      // Save the updated failed attempts
      await user.save();
      return res.render("wrongpassword.ejs", {
        username: `Invalid password. You have ${
          3 - user.failedAttempts
        } attempt(s) left before the account is locked.`,
      });
    }

    // If login is successful, reset failed attempts and lockUntil
    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

    // Set the token in cookies
    res.cookie('authToken', token, { httpOnly: true });

    // Get the user's IP address from the request
    const ipAddress = req.ip;

    // Get location data based on the IP address
    const geo = geoip.lookup(ipAddress);
    const location = geo ? `${geo.city}, ${geo.country}` : 'Location not found';

    // Prepare email notification
    const subject = 'Login Notification';
    const message = `
      <p>Dear ${user.name},</p>
      <p>You have successfully logged in to your account.</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Operating System:</strong> ${req.headers['user-agent']}</p>
      <p>Thank you for using our service!</p>
      <p>Best Regards,<br>Your Support Team</p>
    `;

    // Function to send email
    async function sendEmailNotification(toEmail, subject, message) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or any other email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        html: message,
      };

      // Send email
      await transporter.sendMail(mailOptions);
    }

    // Send email notification
    await sendEmailNotification(user.email, subject, message);

    // Redirect to home page with user data on successful login
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Something went wrong. Please try again!' });
  }
});


// logout
app.get('/logout', verifyToken ,(req,res)=>{
  res.clearCookie('authToken');
  res.redirect('/login');
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

    const newUser = new Register({ name, email, phoneNumber, dob, password ,funds:0});
    await newUser.save();

    res.render('registersuccess');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong. Please try again!' });
  }
});
// app.post('/updateji', async (req, res) => {
//   try {
//     // Update all users to set funds to 0
//     const result = await Register.updateMany({}, { $set: { funds: 0 } });

//     // Send back a response indicating how many documents were modified
//     res.send(`${result.modifiedCount} users' funds have been set to 0 successfully.`);
//   } catch (error) {
//     // Send an error response if something goes wrong
//     console.error('Error updating users:', error);
//     res.status(500).send('Server error while updating users.');
//   }
// });


// Route to verify email
// otp verification system
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,  // Email address stored in .env
      pass: process.env.EMAIL_PASS   // Email password stored in .env
  }
});
// updating route:

// Route to verify OTP and update password
app.post('/check-email', async (req, res) => {
  console.log("check accessed");
  const { email } = req.body;

  try {
      const user = await Register.findOne({ email: email });
      if (!user) {
          return res.status(400).json({ error: 'Email not found!' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      otpMap.set(email, { otp, otpExpiry });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Password Reset',
          text: `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`,
          html: `<p>Your OTP for password reset is: <strong>${otp}</strong>.</p><p>This OTP is valid for 5 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});

app.post('/verify-otp', async (req, res) => {
  console.log("verify email accessed");
  const { email, otp, newPassword } = req.body;
  console.log(req.body);

  const storedOtpInfo = otpMap.get(email);
  if (!storedOtpInfo || storedOtpInfo.otp !== otp || Date.now() > storedOtpInfo.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP!' });
  }

  try {
      await Register.updateOne({ email: email }, { password: newPassword });
      console.log("Password updated successfully.");
      otpMap.delete(email); 
      res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});
app.get('/update',async (req,res)=>{

  
  await Register.updateOne({email:"nitinraj844126@gmail.com"},{userType:"admin"});
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
// app.get('/verifyed',async (req,res)=>{
//   await UserProfile.updateMany({isVerified:'true'},{isVerified:'false'});
//   res.send("changed");
//   console.log("done");

// });
app.get('/contact',(re,res)=>{
  console.log("contact page accessed");
  res.render('contact.ejs');
})
// app.get("/updatedata",async(req,res)=>{
//   const user=await UserProfile.findOne({email:"nitinraj844126@gmail.com"},{isVerified:"true"});
//   console.log(user);
//   res.send("update yopur data");
// })

app.post('/verify/:id', async (req, res) => {
  try {
    const updatedProfile = await UserProfile.findByIdAndUpdate(req.params.id, {
      isVerified: true, // Use boolean true instead of string 'true'
      verified_by: req.body.verifiedBy,
    }, { new: true });

    if (!updatedProfile) {
      return res.status(404).send('User not found');
    }

    // Send verification email
    await sendVerificationEmail(updatedProfile.email, updatedProfile.name);

    res.status(200).send('User verified successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Function to send verification email
async function sendVerificationEmail(userEmail, userName) {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address stored in .env
      pass: process.env.EMAIL_PASS,  // Your email password stored in .env
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: userEmail,                // Recipient email (user's email)
    subject: 'Your Profile has been Verified',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <h2 style="color: #2c3e50;">Hello ${userName},</h2>
        <p style="font-size: 16px;">We are pleased to inform you that your profile has been successfully verified.</p>
        <p style="font-size: 16px;">Thank you for your patience and for being a valued member of our community!</p>
        <div style="background-color: #3498db; padding: 10px; border-radius: 5px; text-align: center;">
          <a href="https://yourwebsite.com" style="color: white; text-decoration: none; font-weight: bold;">Visit Your Profile</a>
        </div>
        <p style="font-size: 16px; margin-top: 20px;">Best Regards,<br>Your Support Team</p>
      </div>
    `
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}
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

// resolving query
app.get('/help-query', async (req, res) => {
  try {
    const pendingQueries = await Help.find({ query_resolved: 'No' });
    const resolvedQueries = await Help.find({ query_resolved: 'Yes' });
    res.render('help_query', { pendingQueries, resolvedQueries });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
// user query
// app.get('/updatedata',(req,res)=>{
//   UserProfile.updateMany({email : "nitinraj844126@gmail.com"},{isVerified:"true"});
//   res.send("updated");
  
// })

// Route to resolve a query

app.post('/help-query/resolve/:id', verifyToken, async (req, res) => {
  const useremail = req.user.email; // Get the user's email from the token
  const { resolved_message } = req.body; // Get the resolved message from the request body

  try {
      // Update the query in the database
      const updatedQuery = await Help.findByIdAndUpdate(req.params.id, {
          query_resolved: 'Yes',
          resolved_message,
          resolved_time: Date.now(),
      }, { new: true }); // Return the updated document

      // Send an email notification
      await sendResolutionEmail(useremail, updatedQuery);

      // Send a success response
      res.json({ success: true, resolvedMessage: updatedQuery.resolved_message });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Function to send the resolution email
async function sendResolutionEmail(userEmail, query) {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER, // Email address stored in .env
          pass: process.env.EMAIL_PASS,  // Email password stored in .env
      },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: userEmail,                // Recipient email (user's email)
    subject: 'Your Query has been Resolved',
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Dear User,</h2>
            <p style="font-size: 16px;">Your query has been resolved:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Query:</strong> ${query.query}</li>
                <li style="margin: 10px 0;"><strong>Resolved Message:</strong> ${query.resolved_message}</li>
                <li style="margin: 10px 0;"><strong>Resolved Time:</strong> ${new Date(query.resolved_time).toLocaleString()}</li>
            </ul>
            <p style="font-size: 16px;">Thank you for reaching out!</p>
            <p style="font-size: 16px;">Best Regards,<br>Support Team</p>
        </div>
    `
};


  try {
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
  } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email not sent'); // Handle email error
  }
}
// Route to submit a new help query

// discover page all stock show
app.get('/stocks', verifyToken,async (req, res) => {
  try {
      const allStocks = await Stock.find({});
      const topStocks = allStocks.slice(0, 3); // Get top 3 stocks
      res.render('stocks', { user:req.user,topStocks, allStocks });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving stocks');
  }
});
// funds sectuon


app.get('/funds', verifyToken, async (req, res) => {
  const userdata = await UserProfile.findOne({ email: req.user.email });
  console.log(userdata);

  try {
    const userId = req.user.id; // Assuming user is logged in and ID is available
    const user = await Register.findById(userId);
   
      const alltransaction=await fundst.find({userId:req.user._id});
      
    
    if (user) {
     
      // Render the 'funds.ejs' template and pass user data
      res.render('funds', { user,alltransaction,userdata });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const sendEmailNotification = (userEmail, subject, message) => {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: message, // Use HTML to format the email nicely
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
};

app.post('/funds/add', verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
      const user = await Register.findById(req.user.id);
      if (!user) return res.status(404).send('User not found');

      user.funds += amount;
      await user.save();

      // Prepare email notification
      const subject = 'Funds Added Successfully';
      const message = createEmailTemplate(user.name, subject, amount, user.funds, 'added');
      sendEmailNotification(user.email, subject, message);

      res.send({ message: 'Funds added successfully!' });
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});


// Withdraw funds
app.post('/funds/withdraw', verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
      const user = await Register.findById(req.user.id);
      if (!user) return res.status(404).send('User not found');

      if (user.funds < amount) {
          return res.status(400).send({ message: 'Insufficient funds' });
      }

      user.funds -= amount;
      await user.save();

      // Prepare email notification
      const subject = 'Funds Withdrawn Successfully';
      const message = createEmailTemplate(user.name, subject, amount, user.funds, 'withdrawn');
      sendEmailNotification(user.email, subject, message);

      res.send({ message: 'Funds withdrawn successfully!' });
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});
app.post('/funds/withdraw', verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
      const user = await Register.findById(req.user.id);
      if (!user) return res.status(404).send('User not found');

      if (user.funds < amount) {
          return res.status(400).send({ message: 'Insufficient funds' });
      }

      user.funds -= amount;
      await user.save();

      // Prepare email notification
      const subject = 'Funds Withdrawn Successfully';
      const message = createEmailTemplate(user.name, subject, amount, user.funds, 'withdrawn');
      sendEmailNotification(user.email, subject, message);

      res.send({ message: 'Funds withdrawn successfully!' });
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});

// stock buy

app.post('/buy-stock', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from token
    const { stockSymbol, quantity } = req.body; // Get stock symbol and quantity from request body

    // Find the user by ID
    const user = await Register.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the stock in the stock database by symbol
    const stock = await Stock.findOne({ stockSymbol });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Calculate the total price of the purchase
    const totalPrice = stock.currentPrice * quantity;

    // Check if the user has enough funds
    if (user.funds < totalPrice) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Find if the user already owns this stock in userstock by stockSymbol and user email
    let existingStock = await userstock.findOne({ stockSymbol: stockSymbol, email: user.email });

    if (existingStock) {
      // If the stock exists, update the quantity and total price
      existingStock.quantity += quantity;  // Increase quantity
      existingStock.totalPrice += totalPrice;  // Update total price
      await existingStock.save();
    } else {
      // If the stock does not exist, create a new entry in userstock
      existingStock = new userstock({
        stockName: stock.companyName, // You can store the name from the stock data
        stockSymbol: stockSymbol, // Use the stock symbol
        email: user.email,
        quantity: quantity,
        totalPrice: totalPrice
      });
      await existingStock.save();
    }

    // Deduct the total price from the user's funds
    user.funds -= totalPrice;
    await user.save();

    // Redirect to confirmation page with purchase details
    res.redirect(`/confirmation?email=${user.email}&stockName=${stock.companyName}&quantity=${quantity}&totalPrice=${totalPrice}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/clear-userstock', async (req, res) => {
  try {
    // Delete all documents from the userstock collection
    await userstock.deleteMany({});
    
    res.status(200).json({ message: 'All user stock data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error occurred while deleting user stock data' });
  }
});

// Confirmation route
app.get('/confirmation', async (req, res) => {
  try {
    const { email, stockName, quantity, totalPrice } = req.query;

    // Create a new stock document with the provided data
    const stock = new userstock({
      email,
      stockName,
      quantity,
      totalPrice
    });

    // Save the stock document to the database
    await stock.save();

    // Log success message to console
    console.log("Stock successfully saved:", stock);

    // Render the confirmation page with purchase details
    res.render('confirmation', { email, stockName, quantity, totalPrice });
    
  } catch (error) {
    // Log error if saving fails
    console.error("Error saving stock:", error);

    // Optionally, render an error page or handle the error in a different way
    res.status(500).send('Error saving the stock details.');
  }
});

// show all yopur stock thst ypou buyed 

app.get('/your_stock', verifyToken, async (req, res) => {
  try {
    const user = req.user.email;
    const yourStocks = await userstock.find({ email: user });
const userFunds=req.user.funds;
    // Render the 'your-stock' view with the user's stocks
    res.render('your-stock', { yourStocks,userFunds });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// sell stocks
app.post('/sell-stock', verifyToken, async (req, res) => {
  console.log(req.body);
  try {
    const userId = req.user.id;
    const { stockSymbol, sellQuantity } = req.body;

    // Find the user
    const user = await Register.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has the stock in their portfolio (basic stock database)
    const userStock = await userstock.findOne({ email: user.email, stockName: stockSymbol });

    // Find the current stock price in the market or Sensex
    const stock = await Stock.findOne({ stockName: stockSymbol });
    const sensexschema = await SensexSchema.findOne({ symbol: stockSymbol });

    if (!stock && !sensexschema) {
      return res.status(404).json({ message: 'Stock not found in the market or Sensex database' });
    }

    // Calculate the total sell price based on where the stock is found
    let totalSellPrice;
    if (stock) {
      totalSellPrice = stock.currentPrice * sellQuantity;
    } else if (sensexschema) {
      totalSellPrice = sensexschema.currentPrice * sellQuantity;
    }

    // If stock is in the user's portfolio (basic stock database)
    if (userStock) {
      // Validate stock ownership and quantity
      if (userStock.quantity < sellQuantity) {
        return res.status(400).json({ message: 'Insufficient stock in user portfolio' });
      }

      // Update the user's stock portfolio (selling from userStock)
      userStock.quantity -= sellQuantity;
      await userStock.save();

      // Update the user's funds
      user.funds += totalSellPrice;
      await user.save();

      // Send response with updated funds and remaining stock quantity
      return res.json({
        message: 'Stock sold successfully from user portfolio',
        updatedFunds: user.funds,
        remainingQuantity: userStock.quantity,
      });
    } 

    // If stock is not in the user's portfolio, try to sell from the Sensex database
    if (sensexschema) {
      const availableStockInMarket = sensexschema.availableQuantity;

      // Check if there are enough stocks available in the Sensex market
      if (availableStockInMarket < sellQuantity) {
        return res.status(400).json({ message: 'Not enough stock available in the Sensex market' });
      }

      // Update the market stock quantity in the Sensex database
      sensexschema.availableQuantity -= sellQuantity;
      await sensexschema.save();

      // Update user's funds
      user.funds += totalSellPrice;
      await user.save();

      // Send response with updated funds and remaining stock in the Sensex market
      return res.json({
        message: 'Stock sold successfully from the Sensex market',
        updatedFunds: user.funds,
        remainingStockInMarket: sensexschema.availableQuantity,
      });
    } 

    // If no stock found in either portfolio or Sensex
    return res.status(400).json({ message: 'Stock not found in either user portfolio or Sensex market' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/transactions', verifyToken, async (req, res) => {
    try {
        const { type, amount, method } = req.body; // Removed date from destructuring

        // Log the request body for debugging
        console.log(req.body);
        
        // Extract user ID from the request (after verifying the token)
        const userId = req.user._id; // Assuming you're storing user info in req.user after authentication

        // Create a new transaction document
        const newTransaction = new fundst({ // Corrected from fundst to Transaction
            userId,
            type,
            amount,
            method,
            date: new Date() // Use current date for the transaction
        });

        // Save the transaction to the database
        await newTransaction.save();

        // Respond with success message and transaction details
        res.status(201).json({ message: 'Transaction saved successfully', transaction: newTransaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save transaction' });
    }
});

app.post('/transactions/log', verifyToken, async (req, res) => {
  try {
      const { type, amount, method } = req.body; // Removed date from destructuring

      // Log the request body for debugging
      console.log(req.body);
      
      // Extract user ID from the request (after verifying the token)
      const userId = req.user._id; // Assuming you're storing user info in req.user after authentication

      // Create a new transaction document
      const newTransaction = new fundst({ // Corrected from fundst to Transaction
          userId,
          type,
          amount,
          method,
          date: new Date() // Use current date for the transaction
      });

      // Save the transaction to the database
      await newTransaction.save();

     

      // Respond with success message and transaction details
      res.status(201).json({ message: 'Transaction saved successfully', transaction: newTransaction });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to save transaction' });
  }
});
// mutual funds section
app.post('/add-mutual-fund', verifyToken, async (req, res) => {
  
  try {
    const { fundName, fundType, manager, minimumInvestment, currentNAV, description } = req.body;
    console.log(req.body);

    // Create a new Mutual Fund document
    const newMutualFund = new MutualFund({
      fundName,
      fundType,
      manager,
      minimumInvestment,
      currentNAV,
      description,
    });

    // Save to database
    await newMutualFund.save();

    // Render the same page with a success message
    res.render('adminAddMutualFund', { 
      message: 'Mutual fund added successfully!', 
      type: 'success' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/admin/add-mutual-fund', verifyToken, (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).send('You do not have permission to access this page.');
}

  if(req.user.userType=='user'){
    res.send("hello you are wrong path ");
  }
  res.render('adminAddMutualFund',{message:null}); // Render the EJS template
});
// Route to fetch all mutual funds
app.get('/mutual-funds', async (req, res) => {
  try {
    const mutualFunds = await MutualFund.find();
    res.render('mutual_fund', { mutualFunds });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to handle investment in mutual funds
app.post('/invest', verifyToken, async (req, res) => {
  try {
    const { fundId, amount } = req.body;
    console.log(req.body);

    // Logic to handle investment (e.g., saving investment details to the database)
    const investment = new Investment({
      fundId,
      userId: req.user.id, // Assuming you have user info in req.user
      amount,
    });

    await investment.save();

    res.status(201).json({ message: 'Investment successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/total-investments', async (req, res) => {
  try {
      const investments = await Investment.find();
      const total = investments.reduce((acc, investment) => acc + investment.amount, 0);
      res.json({ totalInvestments: total });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
// COUPON SECTION



// offfer section
app.get("/offer", verifyToken, async (req, res) => {
  try {
    const coupons = await Coupon.find({ email: req.user.email });
    const putokens = await Putoken.find({ isscratched: false }); // Only get unscratched tokens
    
    // Render the "offer" template and pass the coupons to it
    return res.render("offer", { user: req.user, coupons, putokens });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching coupons', error });
  }
});
app.post('/scratch-coupon/:id', verifyToken, async (req, res) => {
  try {
    const couponId = req.params.id;

    // Find the coupon and mark it as scratched
    const coupon = await Putoken.findByIdAndUpdate(couponId, { isscratched: true }, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json({ 
      message: 'Coupon scratched successfully', 
      coupon: {
        discount: coupon.discount,
        validTill: coupon.validTill,
        email: req.user.email // Assuming you have user data from the token
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error scratching coupon', error });
  }
});



// Route to store the coupon
app.post('/api/store-coupon', async (req, res) => {
  const { coupons, email } = req.body;

  try {
      // Assuming you have a Coupon model
      const couponPromises = coupons.map(coupon => {
          return Coupon.create({ ...coupon, email });
      });

      await Promise.all(couponPromises);

      res.status(200).json({ message: 'Coupons stored successfully!' });
  } catch (error) {
      console.error('Error storing coupons:', error);
      res.status(500).json({ message: 'Error storing coupons.' });
  }
});

// Route to get user coupons
// app.get('/api/coupons', verifyToken, async (req, res) => {
//   try {
//       const coupons = await Coupon.find({ email: req.user.email });
//       return res.status(200).json(coupons);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error fetching coupons', error });
//   }
// });


// admoin add coupon
app.get('/put-coupon', verifyToken, (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).send('You do not have permission to access this page.');
}

  res.render('put-coupon', { user: req.user });
});

// Handle Coupon Submission
app.post('/put-coupon', verifyToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).send('You do not have permission to access this page.');
}

  const { discount, validTill } = req.body;
  console.log(req.body);

  try {
      // Create a new Putoken instance
      const coupon = new Putoken({
          discount,
          validTill,
          createdBy: req.user._id, // Getting the ID of the admin
      });

      // Save the coupon to the database
      await coupon.save();

      // Sending success response
      res.status(201).json({ message: 'Coupon created successfully!' });
  } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ message: 'Error creating coupon.' });
  }
});

// ipo section where ipo list
app.get('/ipo', async (req, res) => {
  try {
    const currentIpOs = await Ipo.find(); // Adjust this query to filter for current and upcoming IPOs
    res.render('ipo', { currentIpOs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Admin post route to add a new IPO
app.post('/ipo/add', verifyToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).send('You do not have permission to access this page.');
}

  const { companyName, logoUrl, type, closingDate, minimumInvestment, shares, day, overallSubscription, companyUrl } = req.body;
  console.log(req.body);

  try {
    const newIpo = new Ipo({
      companyName,
      logoUrl,
      type,
      closingDate,
      minimumInvestment,
      shares,
      day,
      overallSubscription,
      companyUrl
    });

    await newIpo.save();
    res.redirect('/ipo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
app.get('/show_ipo',verifyToken,async (req,res)=>{
  try {
    const currentIpOs = await Ipo.find(); // Adjust this query to filter for current and upcoming IPOs
    res.render('show_ipo', { currentIpOs,user:req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }

})
// app.get('/clear',async (req,res)=>{
//   await Booking.deleteMany({});
//   res.send("done we remove all data");
// })
// saving booking ipo and data
app.post('/book-ipo', async (req, res) => {
  try {
      // Extract payment data from request body
      const { slots, bidPrice, userEmail, paymentMethod, companyName, ipoId } = req.body;
      console.log(req.body);

      // Calculate total price
      const totalPrice = slots * bidPrice;

      // Create a new booking record
      const newBooking = new Booking({
          slots,
          bidPrice,
          userEmail,
          paymentMethod,
          companyName,
          ipoId,
          totalPrice
      });

      // Save the booking to the database
      await newBooking.save();
      console.log("saved in database");

      // Send confirmation email to the user
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: userEmail,                 // Receiver address
        subject: 'IPO Booking Confirmation', // Subject line
        html:`
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 5px; max-width: 600px; margin: auto;">
    <h2 style="color: #333; text-align: center;">IPO Booking Confirmation</h2>
    <p style="font-size: 16px; color: #555;">Dear User,</p>
    <p style="font-size: 16px; color: #555;">
        Your request for IPO booking has been accepted.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Company</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Slots</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Bid Price</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Total Price</th>
            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Status</th>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${companyName}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${slots}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${bidPrice}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${totalPrice}</td>
            <td style="padding: 10px;color:red; border: 1px solid #ddd;">Pending</td>
        </tr>
    </table>
    <p style="font-size: 16px; color: #555; margin-top: 20px;">
        Thank you for your request!
    </p>
    <p style="font-size: 16px; color: #555;">Best regards,<br>Your Company Name</p>
</div>
`,
    };
    
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('Error sending email:', error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });

      // Sample response to indicate success
      return res.status(200).json({ message: 'Payment processed successfully!', ipoId, companyName, totalPrice });
  } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ message: 'An error occurred while processing your payment. Please try again.' });
  }
});

app.get('/user_ipo', verifyToken,async (req, res) => {
  try {
      const alldata = await Booking.find({ userEmail: req.user.email });
      res.render('user_ipo', { user: req.user, alldata });
  } catch (error) {
      console.error('Error fetching user IPO data:', error);
      res.status(500).send('An error occurred while fetching your IPO bookings.');
  }
});

// Route to fetch all IPO bookings for admin review
app.get('/admin/ipo', verifyToken,async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).send('You do not have permission to access this page.'); // Send 403 Forbidden status with message
}
  try {
      const allIpoBookings = await Booking.find({});
      res.render('admin_ipo', { alldata: allIpoBookings });
  } catch (error) {
      console.error('Error fetching IPO bookings:', error);
      res.status(500).send('Error fetching IPO bookings');
  }
});
app.post('/admin/ipo/:id', verifyToken, async (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).send('You do not have permission to access this page.');
    }
    
    const { action } = req.body; // action can be 'approve' or 'reject'
    
    try {
        // Find the booking record by ID
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).send('Booking not found.');
        }

        const updatedStatus = action === 'approve' ? 'Confirmed' : 'Rejected';

        // Update the booking status in the database
        await Booking.findByIdAndUpdate(req.params.id, { status: updatedStatus });

        // Prepare email details
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: booking.userEmail,         // Receiver address
            subject: 'IPO Booking Confirmation', // Subject line
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 5px; max-width: 600px; margin: auto;">
                    <h2 style="color: #333; text-align: center;">IPO Booking Confirmation</h2>
                    <p style="font-size: 16px; color: #555;">Dear User,</p>
                    <p style="font-size: 16px; color: #555;">
                        Your request for IPO booking has been ${updatedStatus.toLowerCase()}.
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Company</th>
                            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Slots</th>
                            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Bid Price</th>
                            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Total Price</th>
                            <th style="background-color: #007BFF; color: white; padding: 10px; text-align: left;">Status</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.companyName}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.slots}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.bidPrice}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.totalPrice}</td>
                            <td style="padding: 10px; color: ${updatedStatus === 'Confirmed' ? 'green' : 'red'}; border: 1px solid #ddd;">
                                ${updatedStatus}
                            </td>
                        </tr>
                    </table>
                    <p style="font-size: 16px; color: #555; margin-top: 20px;">
                        Thank you for your request!
                    </p>
                    <p style="font-size: 16px; color: #555;">Best regards,<br>Your Company Name</p>
                </div>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Redirect back to the admin IPO page
        res.redirect('/admin/ipo');
    } catch (error) {
        console.error('Error updating IPO status or sending email:', error);
        res.status(500).send('Error updating IPO status or sending email');
    }
});
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBnYX0Y9gpCGSUgn9C67ABMqeL1wGeUvLw"; // Your API Key
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful assistant.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// gemini for data 
app.get('/ask_gemini', (req, res) => {
  res.render('askgemini', { result: null, error: null });
});

// POST route to handle form submission

app.post('/ask-gemini', async (req, res) => {
  const userQuestion = req.body.question;
  console.log("User question:", userQuestion);

  try {
      // Start the chat session and send the user's question
      const chatSession = model.startChat({
          generationConfig,
          history: [], // Optionally, add message history
      });

      // Log chatSession for debugging
      console.log('Chat session started:', chatSession);

      const result = await chatSession.sendMessage(userQuestion);

      // Log the result for debugging
      console.log('Response from Gemini API:', result);

      const responseText = result.response.text(); // Ensure result.response.text() is valid

      // Render the response in the EJS view
      res.render('askgemini', { result: responseText, error: null });
  } catch (error) {
      console.error('Error fetching Gemini data:', error.message);

      // Log the error details for debugging
      console.error('Error details:', error);

      // Render error message if the request fails
      res.render('askgemini', { result: null, error: 'Error: Could not fetch data from Gemini API. Please try again.' });
  }
});

// fetching api data to real time stock data
app.get('/fetch-data', (req, res) => {
  const companyName = "IBM"; // Static company name (You can make it dynamic later)
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${companyName}&interval=5min&apikey=HTP3PV53UIFE2J89`;

  request.get(
      {
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' },
      },
      (err, apiRes, data) => {
          if (err) {
              console.error('Error:', err);
              return res.render('fetchdata', { companyName, data: null, error: 'Error fetching data' });
          } else if (apiRes.statusCode !== 200) {
              console.error('Status:', apiRes.statusCode);
              return res.render('fetchdata', { companyName, data: null, error: 'Error fetching data' });
          }

          // Render the EJS template with fetched data and company name
          res.render('fetchdata', { companyName, data, error: null });
      }
  );
});

app.get('/gold-investments',verifyToken, async (req, res) => {
  try {
      const goldInvestments = await GoldInvestment.find({});
      res.render('goldInvestments', { goldInvestments, userFunds: req.user.funds });
  } catch (error) {
      console.error('Error fetching gold investments:', error);
      res.render('goldInvestments', { error: 'Error fetching gold investment options.' });
  }
});

// Route to invest in gold
app.post('/invest-in-gold', async (req, res) => {
  const { goldTypeId, units, userFunds } = req.body;
  const goldInvestment = await GoldInvestment.findById(goldTypeId);

  if (!goldInvestment) {
      return res.status(400).send('Gold type not found.');
  }

  const totalInvestment = goldInvestment.pricePerUnit * units;
  
  if (totalInvestment > userFunds) {
      return res.status(400).send('Insufficient funds for this investment.');
  }

  // Proceed with the investment
  try {
      // Deduct the funds from the user account (assuming user model has funds field)
      req.user.funds -= totalInvestment;
      await req.user.save();

      // Create a new UserInvestment record
      const newInvestment = new UserInvestment({
          userId: req.user._id,
          goldType: goldInvestment._id,
          unitsInvested: units,
          totalInvestment: totalInvestment,
      });

      await newInvestment.save();

      // Update the available units in the gold investment type
      goldInvestment.availableUnits -= units;
      await goldInvestment.save();

      res.redirect('/gold-investments'); // Redirect back to the gold investments page
  } catch (error) {
      console.error('Error investing in gold:', error);
      res.status(500).send('Error processing the investment.');
  }
});
// admin who like gold lie investment post
app.get('/add-gold-investment',verifyToken, (req, res) => {
  res.render('addGoldInvestment',{successMessage:null});  // Render the form view
});
app.post('/admin/add-gold-investment',verifyToken, async (req, res) => {
  const { type, pricePerUnit, description, availableUnits } = req.body;

  try {
      const newGoldInvestment = new GoldInvestment({
          type,
          pricePerUnit,
          description,
          availableUnits
      });

      await newGoldInvestment.save();  // Save the data to the database

      // Send success message after saving
      res.render('addGoldInvestment', {
          successMessage: 'Gold Investment data saved successfully!',
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error saving gold investment data');
  }
});
app.get('/gold-investment-list', async (req, res) => {
  try {
      const investments = await GoldInvestment.find();  // Get all gold investment data
      console.log(investments);
      res.render('goldInvestmentList', { investments });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching gold investment data');
  }
});





// rendering sensex data to page;
app.get("/sensex",async (req,res)=>{
  const companies=await SensexSchema.find({});
  
  res.render("sensex",{ companies: companies });

})
// nifty schema
app.get("/nifty",async (req,res)=>{
  const companies=await NiftySchema.find({});
  
  res.render("nifty",{ companies: companies });

})

const verifyTokenfree = async (req, res, next) => {
  // Skip token verification for the /login route
  if (req.path === '/login') {
    return next();
  }

  const token = req.cookies.authToken; // Assuming token is stored in cookies

  if (!token) {
    // If there's no token and the user is not logged in, send the next middleware
    req.user = null;  // Mark user as null when no token is available
    return next();
  }

  // If there is a token, verify it
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      // If the token is invalid, treat as not logged in
      req.user = null; // Mark user as null if token verification fails
      return next();
    }

    try {
      // Fetch the user data from the database
      const user = await Register.findById(decoded.id);
      if (!user) {
        // If no user is found, treat as not logged in
        req.user = null;
        return next();
      }

      // If the user exists, attach the user data to the request object
      req.user = user;
      next();  // Continue to the next middleware/route handler
    } catch (error) {
      console.error(error);
      req.user = null;  // In case of error, mark user as null
      return next();
    }
  });
};
// nifty paymrnt system to that
app.get('/payment', verifyTokenfree, (req, res) => {
  // Check if the user is logged in
  if (req.user === null) {
    // If no user data, prompt to login
    return res.json({ message: "You need to log in first to buy any stocks." });
  }

  const { name, funds, email } = req.user;

  // Extract payment details from query params
  const { companyName, currentPrice, quantity, totalPrice } = req.query;

  // Check if the user has enough funds for the payment
  if (funds < totalPrice) {
    // If funds are insufficient, show an error or redirect
    return res.render('paymentPage', {
      companyName,
      currentPrice,
      quantity,
      totalPrice,
      name,
      funds,
      email,
      errorMessage: "Insufficient funds. Please add more funds to proceed."
    });
  }

  // If the user is logged in and has enough funds, render the payment page
  res.render('paymentPage', {
    companyName,
    currentPrice,
    quantity,
    totalPrice,
    name,
    funds,
    email
  });
});




// // Payment success route
app.get('/payment-success', async (req, res) => {
  console.log(req.query);
  const { email, companyName, currentPrice, quantity, totalPrice } = req.query;

  if (!companyName || !currentPrice || !quantity || !totalPrice || !email) {
      return res.status(400).send('Missing query parameters');
  }

  try {
    // Fetch the user by email
    const user = await Register.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Save the payment data to the database
    const newPayment = new userstock({
      email,
      stockName: companyName,
      stockSymbol: companyName,  // You might want to adjust the stock symbol logic
      currentPrice: parseFloat(currentPrice),
      quantity: parseInt(quantity),
      totalPrice: parseFloat(totalPrice),
    });

    // Save payment to the database
    await newPayment.save();

    // Deduct the total price from the user's funds
    user.funds -= totalPrice;

    // Save the updated user funds
    await user.save();

    // Render the success page with the payment details
    res.render('payment-success', {
      companyName,
      currentPrice,
      quantity,
      totalPrice,
    });
    
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/alltransaction', verifyToken, async (req, res) => {
  const email = req.user.email;
  try {
    const userTransactions = await userstock.find({ email });
    res.render("alltransaction", { userTransactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/alltransaction', verifyToken, async (req, res) => {
  const email = req.user.email;
  const searchQuery = req.query.search || '';

  try {
    // Query for user transactions, filtered by stock name or date
    const userTransactions = await userstock.find({
      email,
      $or: [
        { stockName: { $regex: searchQuery, $options: 'i' } },
        { createdAt: { $gte: new Date(searchQuery) } } // Filter by date (if date format is valid)
      ]
    });

    res.render("alltransaction", { userTransactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});

// doenload invoic
app.get('/download-invoice/:transactionId', (req, res) => {
  const { transactionId } = req.params;

  // Example data for the transaction (replace with DB query)
  const transaction = {
    id: transactionId,
    stockName: 'Sample Stock',
    stockSymbol: 'SMP',
    email: 'user@example.com',
    quantity: 10,
    currentPrice: 50.75,
    totalPrice: 507.5,
    createdAt: new Date(),
  };

  // Create a PDF document
  const doc = new PDFDocument();
  const filename = `Invoice_${transactionId}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(20).text('Transaction Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Transaction ID: ${transaction.id}`);
  doc.text(`Stock Name: ${transaction.stockName}`);
  doc.text(`Stock Symbol: ${transaction.stockSymbol}`);
  doc.text(`Email: ${transaction.email}`);
  doc.text(`Quantity: ${transaction.quantity}`);
  doc.text(`Current Price: Rs${transaction.currentPrice.toFixed(2)}`);
  doc.text(`Total Price: Rs${transaction.totalPrice.toFixed(2)}`);
  doc.text(`Date: ${transaction.createdAt.toLocaleString()}`);
  doc.moveDown();
  doc.text('Terms and Conditions:', { underline: true });
  doc.text('1. This invoice is a receipt for your transaction.');
  doc.text('2. No refunds or cancellations after the transaction is completed.');
  doc.text('3. Ensure you verify the details in case of discrepancies.');

  // Finalize the PDF and end the stream
  doc.end();
});

// Star
// upstock api
app.get('/auth/login', (req, res) => {
  const apiKey = '4a6c0071-3391-464c-81f2-435da8dbb04b'; // Your API Key
  const apiSecret = '5u8w8sq3qp'; // Your API Secret
  const redirectUri = 'http://localhost:3000/auth/callback'; // Your redirect URL

  // Construct the authorization URL
  const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.query.state || ''}`;
  
  // Redirect to Upstox login
  res.redirect(authUrl);
});
// Handle the callback from Upstox on the /auth route
app.get('/auth/callback',  async (req, res) => {
  console.log("Callback URL called");

  const { code } = req.query;

  if (!code) {
    return res.status(400).send({ error: "Authorization code not found" });
  }

  try {
    const response = await axios.post(
      `https://api.upstox.com/v2/login/authorization/token`,
      new URLSearchParams({
        code: code, // The authorization code received from Upstox
        client_id: '4a6c0071-3391-464c-81f2-435da8dbb04b',
        client_secret: '5u8w8sq3qp',
        redirect_uri: 'http://localhost:3000/auth/callback', // Ensure this matches
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    console.log(response.data);

    res.json({
      message: "Authentication successful!",
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error("Error fetching access token:", error.response?.data || error.message);
    res.status(500).send({ error: "Failed to fetch access token" });
  }
});


// Route to fetch stock data
app.get('/stockss', async (req, res) => {
  const access_token  ="eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI1R0JGOFkiLCJqdGkiOiI2NzU2ZTQwMjI3MmIxNTJjYzJlOTIzN2MiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaWF0IjoxNzMzNzQ3NzE0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3MzM3ODE2MDB9.BA-mRTSRQzgbTZQ1_qe6nPICHmS8HwRRGi4JCYLC7XI"; // Access token from the client query

  if (!access_token) {
    return res.status(400).send({ error: 'Access token is required' });
  }

  try {
    // API call to fetch stock data
    const response = await axios.get(
      'https://api.upstox.com/api/market/quotes',
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Pass the token in the Authorization header
        },
      }
    );

    // Assuming the API responds with the stock data
    const stockData = response.data;

    res.json({
      message: 'Stock data retrieved successfully',
      stockData,
    });
  } catch (error) {
    console.error('Error fetching stock data:', error.response?.data || error.message);
    res.status(500).send({ error: 'Failed to fetch stock data' });
  }
});

// Start server
const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    chalk.bgGreen.white(`\n\n  Server is running on port ${port}  \n`) +
    chalk.blue(`  Visit: http://localhost:${port}  \n`) +
    chalk.yellow(`  Enjoy your coding journey!  \n`) +
    chalk.red(`  Don't forget to take breaks!  \n\n`)
  );
});