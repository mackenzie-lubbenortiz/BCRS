/**
 * Title: mongo.js
 * Author: Professor Richard Krasso and Brock Hemsouvanh
 * Date: 07/10/2024
 * Description: Utility for handling MongoDB operations
 */

"use strict";

// Import MongoClient from the MongoDB library
const { MongoClient } = require("mongodb");

// MongoDB connection string
const MONGO_URL = "mongodb+srv://bcrs_user:s3cret@bellevueuniversity.0wy1rgj.mongodb.net/?retryWrites=true&w=majority&appName=BellevueUniversity";

/**
 * A utility function to connect to MongoDB, perform database operations, and handle errors.
 * @param {function} operations - A function containing the database operations to be performed.
 * @param {function} next - The next middleware function in the Express.js request-response cycle.
 */
const mongo = async (operations, next) => {
  let client;
  try {
    console.log("Connecting to the database...");

    // Connect to the MongoDB database
    client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true, // Use the new URL string parser
      useUnifiedTopology: true // Use the new Server Discover and Monitoring engine
    });

    // Select the 'bcrsDB' database
    const db = client.db("bcrsDB");
    console.log("Connected to the database!");

    // Execute the provided database operations
    await operations(db);
    console.log("Operation was successful!");

  } catch (err) {
    // Handle any errors that occur during the database operations
    const error = new Error("Error connecting to the database: " + err.message);
    error.status = 500;
    console.error("Error connecting to the database:", err);
    if (next) next(error);
  } finally {
    // Close the database connection
    if (client) {
      await client.close();
      console.log("Disconnected from the database.");
    }
  }
}

// Export the mongo function for use in other modules
module.exports = { mongo };
