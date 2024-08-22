const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const { sendErrorResponse } = require('../utils/errors');

// Middleware to authenticate requests with a JWT token

const authenticateToken = (req, res, next) => {
    // Get the Authorization header from the request
    const authHeader = req.headers['authorization'];

    // Extract the token from the Authorization header
    // The expected format is "Bearer token", so we get the second part
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, return a 401 Unauthorized error
    if (!token) {
        return sendErrorResponse(res, 401, "Unauthorized");
    }

    // Verify the token using the secret key
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            // If the token is invalid or cannot be verified, return a 403 Forbidden error
            return sendErrorResponse(res, 403, "Invalid token");
        }
        // Attach the decoded user information to the request object
        req.user = user;
        // Pass control to the next middleware or controller
        next();
    });
};

module.exports = { authenticateToken };


