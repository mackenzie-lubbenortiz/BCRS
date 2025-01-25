/**
 * Title: index.js
 * Author: Brock Hemsouvanh
 * Date: 07/09/2024
 * Description: Aggregates all route modules
 */

'use strict';

const express = require('express');
const router = express.Router();
const userRoutes = require('./user-routes');
const securityRoutes = require('./security-routes');
const serviceRoutes = require('./service-routes');

// Use user routes
router.use('/users', userRoutes);

// Use security routes
router.use('/security', securityRoutes);

// Use service routes
router.use('/services', serviceRoutes);

module.exports = router;
