const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const app = express();
app.use(cors()); // Enabling CORS for cross-origin requests
app.use(bodyParser.json({ limit: '10mb' })); // Parsing JSON data with a size limit
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Parsing URL-encoded data
const port = 3002; // Port on which the server will run

// Database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'e-commerse-db',
});

// Connecting to the MySQL database
db.connect((err) => {
  if (err) console.error(err.message);
  else console.log('Connected to MySQL database.');
});

// Basic route to test API
app.get('/', (req, res) => {
  res.send('Hello, ExpressAPI with MySQL!');
});

// Hardcoded email credentials for sending verification emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '', // Your email
    pass: '', // Your app password
  }
});

// Function to send verification code via email
const sendCodeEmail = async (email, code) => {
  const mailOptions = {
    from: 'asgarovravan@gmail.com',
    to: email,
    subject: 'Identification',
    text: `Your identification code is: ${code},`
  };

  try {
    await transporter.sendMail(mailOptions); // Send email
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Email error:", err); // Error handling for email
    throw new Error(`Failed to send email. ${err.message}`);
  }
};

// Maps to temporarily store verification data
const signinStorage = new Map();
const forgetStorage = new Map();

// Route for user registration and sending verification code
app.post('/api/enter', async (req, res) => {
  const { email, password, name, birthyear } = req.body;

  try {
    // Validate the incoming data using Joi
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().min(2).required(),
      birthyear: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if email already exists in the database
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Error checking user email.' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists.' });
      }

      // Hash password before storing in the database
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed password:", hashedPassword);

      // Generate a random code for verification
      const randomCode = Math.floor(Math.random() * 999999) + 1;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Expiry time in ISO format

      // Store the user data temporarily with the generated verification code
      signinStorage.set(email, {
        email,
        password: hashedPassword,
        name,
        birthyear,
        code: randomCode,
        expiresAt,
      });

      // Send the verification email
      sendCodeEmail(email, randomCode);
      res.status(200).json({ message: "Verification code sent successfully!" });
    });
  } catch (err) {
    console.error("Error in /api/enter:", err);
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

// Route for verifying the user with the code entered
app.post('/api/enter/end', async (req, res) => {
  const { code, email } = req.body;

  try {
    const userEntry = Array.from(signinStorage.entries()).find(
      ([_, value]) => String(value.email) === String(email) 
    );
    if (!userEntry) {
      return res.status(400).json({ message: "User not found or invalid email." });
    }
    
    const [_, userStorage] = userEntry;

    // Check if entered code matches the stored code
    if (Number(userStorage.code) !== Number(code)) {
      return res.status(400).json({ message: "Invalid code entered." });
    }
    
    // Check if the verification code has expired
    if (Date.now() > userStorage.expiresAt) {
      signinStorage.delete(email); // Remove expired code from memory
      return res.status(400).json({ message: "The verification code has expired." });
    }

    // Create a new user object and insert into the database
    const newUser = {
      name: userStorage.name,
      email: userStorage.email,
      password: userStorage.password,
      birthyear: userStorage.birthyear,
    };

    const insertQuery = 'INSERT INTO users (name, email, password, birthyear) VALUES (?, ?, ?, ?)';
    const values = [userStorage.name, userStorage.email, userStorage.password, userStorage.birthyear];
    signinStorage.delete(email); // Clear temporary data after successful insertion

    // Insert the new user into the database
    db.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("SQL Error:", err.message);
        return res.status(500).json({ message: 'Error adding user. ' + err.message });
      }
      res.status(201).json({ message: 'User added successfully.' });
    });
  } catch (err) {
    res.status(500).json({ message: `Error occurred: ${err.message}` });
  }
});

// Route for logging in the user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // SQL query to find user by email
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database query error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = results[0]; // Assuming email is unique

    // Check if password matches the hashed password stored in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.status(200).json({ message: 'Login successful!' });
    } else {
      res.status(400).json({ message: 'Invalid password.' });
    }
  });
});

// Password recovery first step (sending recovery code)
app.post('/api/recovery/password/first', async (req, res) => {
  const { email } = req.body;

  // SQL query to check if the email exists in the database
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Error checking user email.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Email not found.' });
    }

    const randomCode = Math.floor(Math.random() * 999999) + 1;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    // Store the recovery code temporarily
    forgetStorage.set(email, { email, code: randomCode, expiresAt });

    try {
      await sendCodeEmail(email, randomCode);
      res.status(200).json({ message: "Password recovery code sent successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

// Password recovery second step (verify recovery code)
app.post('/api/recovery/password/second', async (req, res) => {
  const { code, email } = req.body;

  const userEntry = Array.from(forgetStorage.entries()).find(
    ([_, value]) => String(value.email) === String(email)  
  );

  if (!userEntry) {
    return res.status(400).json({ message: "Invalid recovery code entered." });
  }

  const [_, userStorage] = userEntry;

  // Check if the code is valid
  if (Number(userStorage.code) !== Number(code)) {
    return res.status(400).json({ message: "Invalid code entered." });
  }

  // Check if the code has expired
  if (Date.now() > userStorage.expiresAt) {
    return res.status(400).json({ message: "The recovery code has expired." });
  }

  res.status(200).json({ message: "Code successfully verified!", email });
});

// Final step for updating the password
app.post('/api/recovery/password/third', async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ message: "Password and email are required." });
  }

  try {
    // Hash the new password before storing it
    let hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to update the user's password
    const query = "UPDATE users SET password = ? WHERE email = ?";
    const values = [hashedPassword, email];

    const result = await db.execute(query, values); // Execute query

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No user found with the provided email." });
    }

    forgetStorage.delete(email); // Clear the stored recovery data
    res.status(200).json({ message: "Password successfully updated!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "An error occurred while updating the password." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});