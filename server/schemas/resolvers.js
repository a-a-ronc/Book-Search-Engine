const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const data = await User.findOne({ _id: context.user._id });
        return data;
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          {
            _id: context.user._id,
          },
          {
            $push: { savedBooks: bookData },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    },
    removeBook: async (parent, args, context) => {
      if (context.book) {
        return User.findOneAndDelete({ _id: context.book._id });
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;