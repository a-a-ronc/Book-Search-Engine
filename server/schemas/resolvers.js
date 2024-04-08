// schemas/resolvers.js
const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // Query resolvers here...
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address.');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password.');
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('A user with this email already exists.');
      }

      // Create a new user with the provided information
      const user = new User({ username, email, password });

      // Hash the user's password
      await user.save();

      // Generate a token for the new user
      const token = signToken(user);

      // Return an auth object that includes the token and user info
      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        if (!updatedUser) {
          throw new Error('No user with this id!');
        }

        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
