/**
 * Title: security-routes.js
 * Author: Professor Richard Krasso, Brock Hemsouvanh, Mackenzie Lubben-Ortiz, and Phuong Tran
 * Date: 7/10/24
 * Updated: 07/19/2024 by Brock Hemsouvanh
 * Description: Routes for handling security-related API requests
 */

"use strict";

// Imports
const express = require('express');
const { mongo } = require('../utils/mongo');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const Ajv = require('ajv');

const router = express.Router();
const saltRounds = 10;
const ajvInstance = new Ajv();

// Schemas
const securityQuestionSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      questionText: { type: 'string' },
      answerText: { type: 'string' }
    },
    required: ['questionText', 'answerText']
  }
};

const registerSchema = {
  type: 'object',
  properties: { 
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    address: { type: 'string' },
    phoneNumber: { type: 'string' },
    role: { type: 'string' },
    isDisabled: { type: 'boolean'},
    selectedSecurityQuestions: securityQuestionSchema
  },
  required: ['firstName', 'lastName', 'email', 'password', 'address', 'phoneNumber', 'selectedSecurityQuestions'],
  additionalProperties: false
};

const signInSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false
};

// Routes

router.get('/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});

/**
 * @swagger
 * /api/security/verify/users/{email}/security-questions:
 *   post:
 *     summary: Verify user's security questions
 *     tags: [Security]
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedSecurityQuestions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                     answerText:
 *                       type: string
 *     responses:
 *       200:
 *         description: Security questions verified successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post("/verify/users/:email/security-questions", async (req, res) => {
  try {
    const { email } = req.params; // Extract email from the request parameters
    const { selectedSecurityQuestions } = req.body; // Extract security questions from the request body

    // Validate the input
    if (!email || !selectedSecurityQuestions || !Array.isArray(selectedSecurityQuestions)) {
      return res.status(400).send({ message: "Bad Request: Invalid input" });
    }

    // Connect to the database
    mongo(async (db) => {
      // Find the user by email
      const user = await db.collection("users").findOne({ email });

      // If the user is not found, return a 404 error
      if (!user) {
        return res.status(404).send({ message: "Not Found: User not found" });
      }

      // Verify that the provided security questions and answers match the user's stored questions and answers
      const isVerified = selectedSecurityQuestions.every((question, index) =>
        question.questionText === user.selectedSecurityQuestions[index].questionText &&
        question.answerText === user.selectedSecurityQuestions[index].answerText
      );

      // If the verification fails, return a 400 error
      if (!isVerified) {
        return res.status(400).send({ message: "Bad Request: Security questions do not match" });
      }

      // If verification is successful, return a 200 response
      res.status(200).send({ message: "Security questions verified successfully" });
    });
  } catch (e) {
    // Handle any other errors with a 500 response
    res.status(500).send({ message: `Internal Server Error: ${e.message}` });
  }
});

/**
 * @swagger
 * /api/security/users/{email}/reset-password:
 *   post:
 *     summary: Reset user's password
 *     tags: [Security]
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post("/users/:email/reset-password", async (req, res) => {
  try {
    const { email } = req.params; // Extract email from the request parameters
    const { newPassword } = req.body; // Extract new password from the request body

    // Validate the input
    if (!email || !newPassword) {
      return res.status(400).send({ message: "Bad Request: Invalid input" });
    }

    // Connect to the database
    mongo(async (db) => {
      // Find the user by email
      const user = await db.collection("users").findOne({ email });

      // If the user is not found, return a 404 error
      if (!user) {
        return res.status(404).send({ message: "Not Found: User not found" });
      }

      // Update the user's password
      const hashedPassword = bcrypt.hashSync(newPassword, saltRounds); // Hash the new password
      await db.collection("users").updateOne({ email }, { $set: { password: hashedPassword } });

      // Return a 200 response indicating success
      res.status(200).send({ message: "Password reset successfully" });
    });
  } catch (e) {
    // Handle any other errors with a 500 response
    res.status(500).send({ message: `Internal Server Error: ${e.message}` });
  }
});

/**
 * @swagger
 * /api/security/users/{email}/security-questions:
 *   get:
 *     summary: Find a user's selected security questions
 *     tags: [Security]
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: Security questions retrieved successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:email/security-questions', (req, res, next) => {
  try {
    const email = req.params.email; // user email

    console.log('email', email);

    mongo(async db => {
      const user = await db.collection('users').findOne(
        { email: email },
        { projection: { email: 1, userId: 1, selectedSecurityQuestions: 1} },
      );
      console.log('Selected security questions', user);

      if (!user) {
        const err = new Error('Unable to find user with email ' + email);
        err.status = 404;
        console.log('err', err);
        next(err);
        return;
      }
      res.send(user);
    }, next);
  } catch (err) {
    console.log('err', err);
    next(err);
  }
});

/**
 * @swagger
 * /api/security/register:
 *   post:
 *     tags:
 *       - Security
 *     description: API for creating new users
 *     summary: User Registration
 *     requestBody:
 *       description: User Information
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phoneNumber
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: number
 *               address:
 *                 type: string
 *               selectedSecurityQuestions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                     answerText:
 *                       type: string
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request
 *       '409':
 *         description: User already exists
 *       '500':
 *         description: Server Exception
 *       '501':
 *         description: MongoDB Exception
 */
router.post('/register', (req, res, next) => {
  try {
    console.log('Creating a new user...');

    // Get the user information from the request body
    const user = req.body;

    console.log(user);

    // Validate the user data against the registerSchema
    const validate = ajvInstance.compile(registerSchema);
    const valid = validate(user);

    // If the user object is not valid; then return a status code 400 with message 'Bad request'
    if (!valid) {
      console.error('User object does not match the registerSchema: ', validate.errors);
      return next(createError(400, `Bad request: ${validate.errors}`));
    }

    // Encrypt the user's password using bcrypt
    user.password = bcrypt.hashSync(user.password, saltRounds);

    // Make phoneNumber number input into a number
    user.phoneNumber = Number(user.phoneNumber);

    // Call mongo and create the new user
    mongo(async db => {

      console.log("Checking if the user email exists in the database...");
      // Get all the users from the database and sort them by the userId
      const users = await db.collection('users')
        .find()
        .sort({ userId: 1 })
        .toArray();

      // Check if the user exists already in the database
      const existingUser = users.find(u => u.email === user.email);

      // If the user exists; then throw an error status code 409 with message 'User already exists!'
      if (existingUser) {
        console.error('User already exists!');
        return next(createError(409, 'User already exists'));
      }

      // Create the new userId for the registering user by getting the lastUser's userId and adding 1 to it
      let newUserId = 1;
      if (users.length > 0) {
        const lastUser = users[users.length - 1];
        console.log(`lastUserId: ${lastUser.userId}\n First name: ${lastUser.firstName}\n Last name: ${lastUser.lastName}`);
        newUserId = lastUser.userId + 1;
      }
      console.log('new userId:' + newUserId);

      // Create the new user object for standard role
      const newUser = {
        userId: newUserId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        phoneNumber: user.phoneNumber,
        address: user.address,
        isDisabled: false,
        role: 'standard',
        selectedSecurityQuestions: user.selectedSecurityQuestions
      };

      // Insert new user to the user collection
      const result = await db.collection("users").insertOne(newUser);
      console.log('New User created successfully!');
      res.status(201).send(newUser);

    }, next);

  } catch (err) {
    console.error('Error: ', err);
    next(err);
  }
});

/**
 * @swagger
 * /api/security/signin:
 *   post:
 *     tags:
 *       - Security
 *     description: API for signing in users
 *     summary: User Sign in
 *     requestBody:
 *       description: User Information
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User Sign In Successfully
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Invalid Credentials
 *       '500':
 *         description: Server Exception
 *       '501':
 *         description: MongoDB Exception
 */
router.post('/signin', (req, res, next) => {
  try {

    console.log("User signing in...");
    // Get the email address and password from the request body
    const signIn = req.body;

    // Validate the sign in data against the signInSchema
    const validate = ajvInstance.compile(signInSchema);
    const valid = validate(signIn);

    // If the signIn object is not valid; then return a 400 status code with message 'Bad request'
    if (!valid) {
      console.error('Error validating the signIn data with the signInSchema!');
      console.log('signIn validation error: ', validate.errors);
      return next(createError(400, `Bad request: ${validate.errors}`));
    }

    // Call mongo and log in user
    mongo(async db => {
      console.log("Looking up the user...");
      // Find the user
      const user = await db.collection("users").findOne({
        email: signIn.email
      });

      // If the user is found; Then compare password passed in from the body with the password in the database
      if (user) {
        console.log("User found!");
        console.log("Comparing passwords...");
        // Compare the password
        let passwordIsValid = bcrypt.compareSync(signIn.password, user.password);

        // Else if the password doesn't match; then return status code 400 with message "Invalid credentials"
        if (!passwordIsValid) {
          console.error('Invalid password!');
          return next(createError(401, "Unauthorized"));
        }
        // If the password matches; then return status code 200 with message "User sign in"
        console.log("Password matches!");
        res.send(user);
      } else {
        console.error('User not found!');
        return next(createError(404, "User not found"));
      }
    }, next);

    // Catch any Database errors
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

/**
 * verify user by email
 * @openapi
 * /api/security/verify/users/{email}:
 *  post:
 *    tags:
 *      - Security
 *    description: API for verifying a user exists
 *    summary: Verify a user exists
 *    parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        description: Enter the email address for the user
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Success
 *      400:
 *        description: Bad Request
 *      404: 
 *        description: Not Found
 *      500: 
 *        description: Internal Server Error
 */
router.post('/verify/users/:email', (req, res, next) => {
  try {
    //capture the email parameter
    const email = req.params.email;
    console.log('User email', email) // log out the email to the console 
    
    // call the mongo module and pass in the operations function
    mongo(async db => {
      const user = await db.collection('users').findOne({ email: email }) // find the user document by email
      
    // if the user is null return a 404 error to the client 
    if (!user) {
        const err = new Error('Not Found') // create a new Error object
        err.status = 404 // set the error status to 404
        console.log('User not found', err) // log out the error to the console
        next(err) // return the error to the client 
        return // return to the exit the function
    }

    console.log('Select User', user) // log out the user object to the console

    res.send(user) // return the user object to the client
    }, next)
  
  } catch (err) {
    console.log(`API Error: ${err.message}`) // log out the error to the console
    next(err)
  }
 })

// Export the router
module.exports = router;
