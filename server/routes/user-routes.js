/**
 * Title: user-routes.js
 * Author: Professor Richard Krasso and Brock Hemsouvanh
 * Date: 7/05/24
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Routes for handling user-related API requests
 * 
 * This code was developed with reference to the article on using bcrypt in Node.js:
 * https://www.freecodecamp.org/news/how-to-hash-passwords-with-bcrypt-in-nodejs/
 */

'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const { mongo } = require('../utils/mongo');
const createError = require('http-errors');
const { ObjectId } = require('mongodb');
const Ajv = require('ajv');
const ajv = new Ajv();

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The user ID
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *         address:
 *           type: string
 *           description: The user's address
 *         isDisabled:
 *           type: boolean
 *           description: Indicates if the user is disabled
 *         role:
 *           type: string
 *           description: The user's role
 *         selectedSecurityQuestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: The text of the security question
 *               answerText:
 *                 type: string
 *                 description: The answer to the security question
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post("/", async (req, res) => {
  console.log("Creating a new user...");
  try {
    const { email, password, firstName, lastName, phoneNumber, address, isDisabled, role, selectedSecurityQuestions } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      address,
      isDisabled: isDisabled || false,
      role: role || 'standard',
      selectedSecurityQuestions
    };

    await mongo(async (db) => {
      await db.collection("users").insertOne(newUser);
      res.status(201).send({ user: newUser });
    });
  } catch (e) {
    console.error(e);
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: `Bad Request: ${e.message}` });
    } else if (e.name === 'NotFoundError') {
      res.status(404).send({ message: `Not Found: ${e.message}` });
    } else {
      res.status(500).send({ message: `Internal Server Error: ${e.message}` });
    }
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Disable a user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to disable
 *     responses:
 *       204:
 *         description: User disabled successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:userId", async (req, res) => {
  console.log("Disabling user...");
  try {
    const userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Bad Request: Invalid userId" });
    }

    await mongo(async (db) => {
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isDisabled: true } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).send({ message: "Not Found: User not found" });
      }

      res.status(204).send();
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: `Internal Server Error: ${e.message}` });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Find all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', (req, res, next) => {
  console.log('Fetching all users...');
  try {
    mongo(async db => {
      const users = await db.collection('users').find({}, { projection: { _id: 1, userId: 1, firstName: 1, lastName: 1, email: 1, password: 1, phoneNumber: 1, address: 1, isDisabled: 1, role: 1, selectedSecurityQuestions: 1 } })
        .sort({ _id: 1 })
        .toArray();

      console.log('Users retrieved:', users);
      res.json(users);
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *  get:
 *    summary: Find User By Id
 *    tags: [User]
 *    parameters:
 *      - name: userId
 *        in: path
 *        required: true
 *        description: ID of user to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: User successfully found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Internal Server Error
 */
router.get('/:userId', (req, res, next) => {
  try {
    let { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid userId" });
    }
    userId = new ObjectId(userId);

    mongo(async db => {
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { _id: 1, userId: 1, firstName: 1, lastName: 1, email: 1, role: 1, address: 1, phoneNumber: 1 } }
      );

      if (!user) {
        const err = new Error('Unable to find user with userId ' + userId);
        err.status = 404;
        console.error('Error:', err);
        next(err);
        return;
      }

      // Return user with ID as a string
      const userWithId = { ...user, _id: userId.toString() };
      res.send(userWithId);
    }, next);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     tags: [User]
 *     description: API for updating a user's data
 *     summary: Update a user
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The User ID requested by the user.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updating data request
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - role
 *               - isDisabled
 *             properties:
 *               role:
 *                 type: string
 *               isDisabled:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: User updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:userId', (req, res, next) => {
  try {
    let { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid userId" });
    }
    userId = new ObjectId(userId);

    const { _id, ...updateData } = req.body; // Exclude _id from the update payload

    mongo(async db => {
      const result = await db.collection('users').updateOne(
        { _id: userId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        const err = new Error('Unable to find user with userId ' + userId);
        err.status = 404;
        console.error('Error:', err);
        next(err);
        return;
      }

      res.status(204).send();
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/**
 * @swagger
 * /api/users/reset-password-by-id/{userId}:
 *   put:
 *     summary: Reset user password by user ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to reset the password
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put('/reset-password-by-id/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send({ message: "Invalid userId" });
    }

    // Generate a hashed password for the new default password
    const newHashedPassword = await bcrypt.hash('Password01', 10);

    await mongo(async (db) => {
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: newHashedPassword } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "User not found with the provided userId" });
      }

      res.status(200).send({ message: "Password has been reset successfully to 'Password01' for the given user ID." });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: `Internal Server Error: ${e.message}` });
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
    const signIn = req.body;

    const validate = ajv.compile(signInSchema);
    const valid = validate(signIn);

    if (!valid) {
      console.error('Error validating the signIn data with the signInSchema!');
      return next(createError(400, `Bad request: ${validate.errors}`));
    }

    mongo(async db => {
      console.log("Looking up the user...");
      const user = await db.collection("users").findOne({ email: signIn.email });

      if (user) {
        console.log("User found!");
        console.log("Comparing passwords...");
        const passwordIsValid = bcrypt.compareSync(signIn.password, user.password);

        if (!passwordIsValid) {
          console.error('Invalid password!');
          return next(createError(401, "Unauthorized"));
        }

        console.log("Password matches!");
        res.send(user);
      } else {
        console.error('User not found!');
        return next(createError(404, "User not found"));
      }
    }, next);
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
});

module.exports = router;
