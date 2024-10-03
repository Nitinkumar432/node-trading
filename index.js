const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer=require("nodemailer");
require('dotenv').config();
const otpMap = new Map();
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const app = express();
const UserProfile=require('./models/userprofile.js');
const Register = require('./models/register.js');
const Help = require('./models/help.js');
const SECRET_KEY = 'xyxxx'; // Replace with your actual secret key
const port = 3000;
const Stock=require('./models/stock.js');
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
     res.send("your entered password is wrong");
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

    const newUser = new Register({ name, email, phoneNumber, dob, password });
    await newUser.save();

    res.render('registersuccess');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong. Please try again!' });
  }
});

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
app.get('/verifyed',async (req,res)=>{
  await UserProfile.updateMany({isVerified:'true'},{isVerified:'false'});
  res.send("changed");
  console.log("done");

});
app.get('/contact',(re,res)=>{
  console.log("contact page accessed");
  res.render('contact.ejs');
})
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
app.post('/help-query/resolve/:id', async (req, res) => {
  const { resolved_message } = req.body;
  try {
    const updatedQuery = await Help.findByIdAndUpdate(req.params.id, {
      query_resolved: 'Yes',
      resolved_message,
    }, { new: true }); // Return the updated document

    res.json({ success: true, resolvedMessage: updatedQuery.resolved_message }); // Send the resolved message as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' }); // Send error as JSON response
  }
});
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
  try {
    const userId = req.user.id; // Assuming user is logged in and ID is available
    const user = await Register.findById(userId);
    if (user) {
     
      // Render the 'funds.ejs' template and pass user data
      res.render('funds', { user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/funds/add', verifyToken,async (req, res) => {
  const { amount } = req.body;

  try {
      const user = await Register.findById(req.user.id); // Assume userId is set via authentication middleware
      if (!user) return res.status(404).send('User not found');

      user.funds += amount;
      await user.save();

      res.send({ message: 'Funds added successfully!' });
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});

// Withdraw funds
app.post('/funds/withdraw',verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
      const user = await Register.findById(req.user.id); // Assume userId is set via authentication middleware
      if (!user) return res.status(404).send('User not found');

      if (user.funds < amount) {
          return res.status(400).send({ message: 'Insufficient funds' });
      }

      user.funds -= amount;
      await user.save();

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

      // Find the user
      const user = await Register.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Find the stock
      const stock = await Stock.findOne({ stockSymbol });
      if (!stock) {
          return res.status(404).json({ message: 'Stock not found' });
      }

      // Calculate total price
      const totalPrice = stock.currentPrice * quantity;

      // Check if user has enough funds
      if (user.funds < totalPrice) {
          return res.status(400).json({ message: 'Insufficient funds' });
      }

      // Deduct funds from user
      user.funds -= totalPrice;
      await user.save();

      // Redirect to confirmation page with purchase details
      res.redirect(`/confirmation?email=${user.email}&stockName=${stock.companyName}&quantity=${quantity}&totalPrice=${totalPrice}`);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});

// Confirmation route
app.get('/confirmation', (req, res) => {
  console.log("hello");
  const { email, stockName, quantity, totalPrice } = req.query;
  // Render confirmation page with purchase details
  console.log(req.query);
  res.render('confirmation', { email, stockName, quantity, totalPrice });
});
// Start server
const PORT=process.env.PORT || 300;
app.listen(PORT, () => {
  console.log(
    chalk.bgGreen.white(`\n\n  Server is running on port ${port}  \n`) +
    chalk.blue(`  Visit: http://localhost:${port}  \n`) +
    chalk.yellow(`  Enjoy your coding journey!  \n`) +
    chalk.red(`  Don't forget to take breaks!  \n\n`)
  );
});