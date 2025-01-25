/**
 * Title: service-routes.js
 * Author: Brock Hemsouvanh and Mackenzie Lubben-Ortiz
 * Date: 7/18/24
 * Updated: 07/26/2024 by Brock Hemsouvanh
 * Description: Routes for handling service-related API requests
 * This code was developed with reference to the MongoDB aggregation documentation:
 * https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
 */

"use strict";

// Imports
const express = require('express');
const { mongo } = require('../utils/mongo');
const createError = require('http-errors');
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv();
const router = express.Router();

/**
 * @swagger
 * /api/invoices/purchases-graph:
 *   get:
 *     summary: Get a summary of purchases by service
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Purchases summary retrieved successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/purchases-graph", async (req, res) => {
  try {
    mongo(async (db) => {
      const aggregationPipeline = [
        { $unwind: "$lineItems" },
        {
          $group: {
            _id: "$lineItems.name",
            totalAmount: { $sum: "$lineItems.price" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            serviceName: "$_id",
            totalAmount: 1,
            count: 1
          }
        }
      ];

      const purchasesSummary = await db.collection("invoices").aggregate(aggregationPipeline).toArray();
      res.status(200).send(purchasesSummary);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: `Internal Server Error: ${e.message}`,
    });
  }
});

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags:
 *       - Invoice
 *     description: API for creating new invoices
 *     summary: Create an Invoice
 *     requestBody:
 *       description: Invoice Information
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - email
 *               - fullName
 *               - lineItems
 *               - partsAmount
 *               - laborAmount
 *               - lineItemTotal
 *               - invoiceTotal
 *               - orderDate
 *             properties:
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                   required:
 *                     - name
 *                     - price
 *               partsAmount:
 *                 type: number
 *               laborAmount:
 *                 type: number
 *               lineItemTotal:
 *                 type: number
 *               invoiceTotal: 
 *                 type: number
 *               orderDate: 
 *                 type: string
 *     responses:
 *       '201':
 *         description: Invoice created successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Server Exception
 *       '501':
 *         description: MongoDB Exception
 */

// Invoice Schema
const invoiceSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    fullName: { type: 'string' },
    lineItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' }
        },
        required: ['name', 'price']
      }
    },
    partsAmount: { type: 'number' },
    laborAmount: { type: 'number' },
    lineItemTotal: { type: 'number' },
    invoiceTotal: { type: 'number' },
    orderDate: { type: 'string' },
    additionalPartsServices: { type: 'string', default: '' }  // Form can be submitted with these fields being left blank
  },
  required: ['email', 'fullName', 'lineItems', 'partsAmount', 'laborAmount', 'lineItemTotal', 'invoiceTotal', 'orderDate'],
  additionalProperties: false
};


router.post("/", async (req, res) => {
  console.log("Lets create a new invoice!");
  try {
    const validate = ajv.compile(invoiceSchema);
    const valid = validate(req.body);

    if (!valid) {
      console.error('Validation errors:', validate.errors); // Log detailed validation errors
      return res.status(400).send({ message: "Bad Request", errors: validate.errors });
    }

    const newInvoice = {
      email: req.body.email,
      fullName: req.body.fullName,
      lineItems: req.body.lineItems,
      partsAmount: req.body.partsAmount,
      laborAmount: req.body.laborAmount,
      lineItemTotal: req.body.lineItemTotal,
      invoiceTotal: req.body.invoiceTotal,
      orderDate: req.body.orderDate
    };

    mongo(async (db) => {
      const result = await db.collection("invoices").insertOne(newInvoice);
      res.status(201).send({ Invoice: newInvoice });
    });
  } catch (e) {
    console.log(e);
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: `Bad Request: ${e.message}` });
    } else if (e.name === 'NotFoundError') {
      res.status(404).send({ message: `Not Found: ${e.message}` });
    } else {
      res.status(500).send({ message: `Internal Server Error: ${e.message}` });
    }
  }
});

module.exports = router;
