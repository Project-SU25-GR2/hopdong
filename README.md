# Email Verification System

A simple web application that sends verification codes via email and allows users to verify them.

## Setup

1. Install Node.js if you haven't already
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Features

- Send verification codes to any email address
- Verify the received code
- 5-minute expiration for verification codes
- Simple and clean user interface

## Security Note

This is a basic implementation for demonstration purposes. In a production environment, you should:

1. Use environment variables for email credentials
2. Implement rate limiting
3. Use a proper database for storing verification codes
4. Add additional security measures 