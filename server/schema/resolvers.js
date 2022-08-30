const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        getSingleUser: async (parent, { user = null,params }) => {
            return User.findOne({
                $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
              });
        },
    },

    Mutation:{
        createUser: async (parent, { body }) => {
            user = await User.create(body);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { body }) => {
            const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
      
            return { token, user };
        },
        saveBook: async (parent, { user, body }, context) => {
            console.log(user);
            if (context.user){
                return User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks: body } },
                    { new: true, runValidators: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        deleteBook: async (parent, {user, params}, context) => {
            if (context.user) {
                return  User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: params.bookId } } },
                { new: true }
            );
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
}

module.exports = resolvers;