const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({
          _id: context.user._id,
        });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with this email found");
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Password");
      }
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, book, context) => {
      if (context.user) {
        const updateBook = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: book.input } },
          { new: true }
        );
        return updateBook;
      }
      throw new AuthenticationError("Log in to save book");
    },

    removeBook: async (parent, book, context) => {
      if (context.user) {
        const data = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: book.bookId } } },
          { new: true }
        );
        return data;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};
module.exports = resolvers;
