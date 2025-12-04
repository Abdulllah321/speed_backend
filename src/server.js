// Patches
import expressCustomError from 'express-custom-error';
const { inject, errorHandler } = expressCustomError;
inject(); // Patch express in order to use async / await syntax

// Require Dependencies

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';


import logger from '@/util/logger.js';

// Load .env Enviroment Variables to process.env

import mandatoryenv from 'mandatoryenv';
mandatoryenv.load([
    'DATABASE_URL',
    'PORT',
    'SECRET'
]);

const { PORT } = process.env;


// Instantiate an Express Application
const app = express();


// Configure Express App Instance
app.use(express.json( { limit: '50mb' } ));
app.use(express.urlencoded( { extended: true, limit: '10mb' } ));

// Configure custom logger middleware
app.use(logger.dev, logger.combined);

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));
app.use(helmet());

// This middleware adds the json header to every response
app.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
}) // This middleware adds the json header to every response

// Assign Routes

import router from '@/routes/router.js';
app.use('/', router);


// Handle errors
app.use(errorHandler());

// Handle not valid route
app.use('*', (req, res) => {
    res
    .status(404)
    .json( {status: false, message: 'Endpoint Not Found'} );
})

// Open Server on selected Port
app.listen(
    PORT,
    () => console.info('Server listening on port ', PORT)
);