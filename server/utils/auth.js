const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // Initialize user data and token
    let user = null;

    // Get the token from the headers or request body
    let token = req.headers.authorization || req.body.token || req.query.token;

    // Separate "Bearer" from "<tokenvalue>"
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return { user };
    }

    // Verify the token and extract user data
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      user = data;
    } catch (e) {
      console.error(`Invalid token: ${e.message}`);
    }

    // Return the new context with user info
    return { user };
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};

