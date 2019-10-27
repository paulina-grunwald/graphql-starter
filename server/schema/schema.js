const graphql = require('graphql')

const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema, 
} = graphql

const User = require('../model/user')
const Post = require("../model/post");
const Hobby = require("../model/hobby");


//dummy data
// let usersData = [
//   {id: '1', name: 'Alex', age: 24, profession: 'Doctor'},
//   { id: '2', name: 'Mike', age: 12, profession: 'Dentist' },
//   { id: '3', name: 'John', age: 33, profession: 'Programmer' },
//   { id: '4', name: 'Sofia', age: 32, profession: 'Driver' },
//   { id: '5', name: 'Paulina', age: 36, profession: 'Baker' },
// ]

// let hobbiesData = [
//   { id: '1', title: 'Programing', description: 'Likes to write code', userId: '1'},
//   { id: '2', title: 'Rowing', description: 'Likes to row!' },
//   { id: '3', title: 'Swimming', description: 'Likes be in the swimming pool!', userId: '2' },
//   { id: '4', title: 'Hiking', description: 'Likes to climb the mountains!', userId: '4' },
//   { id: '5', title: 'Jogging', description: 'Likes to move!', userId: '4' },
// ]

// let postsData = [
//   { id: '1', comment: 'Building a mind', userId: '1' },
//   { id: '2', comment: 'GraphQl is cool!', userId: '3' },
//   { id: '3', comment: 'JS is cool!', userId: '5' },
//   { id: '4', comment: 'Coding is nice!', userId: '1' },

// ]

//Create types
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Documentation for user',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    age: { type: GraphQLInt },
    profession: { type: GraphQLString },
    posts: {
      type: new GraphQLList(PostType),
      resolve (parent, args) {
        return Post.find({})
      }
    },
    hobbies: {
      type: new GraphQLList(HobbyType),
      resolve (parent, args) {
        return Hobby.find({})
      }
    }
  })
})

const HobbyType = new GraphQLObjectType({
  name: 'Hobby',
  description: 'Documentation for hobby',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve (parent, args) {
        return User.findById(parent.userId)
      }
    }
  })
})

const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    comment: { type: GraphQLString },
    user: {
      type: UserType,
      resolve (parent, args) {
        return User.findById(parent.userId)
      }
    }
  })
})


//RootQuery 
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Description",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return User.findById(args.id);
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      }
    },
    hobby: {
      type: HobbyType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Hobby.findById(args.id);
      }
    },
    hobbies: {
      type: new GraphQLList(HobbyType),
      resolve(parent, args) {
        return Hobby.find({});
      }
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Post.findById(args.id);
      },
      users: {
        type: new GraphQLList(UserType),
        resolve(parent, args) {
          return User.find();
        }
      },
      posts: {
        type: new GraphQLList(UserType),
        resolve(parent, args) {
          return Post.find();
        }
      },
      hobbies: {
        type: new GraphQLList(HobbyType),
        resolve(parent, args) {
          return Hobby.find();
        }
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parent, args) {
        return Post.find({});
      }
    }
  }
});

//Mutation
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        profession: { type: GraphQLString }
      },
      resolve(parent, args) {
        let user = new User({
          name: args.name,
          age: args.age,
          profession: args.profession
        });
        //save to the db
        user.save();
        return user;
      }
    },
    removeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        let removedUser = User.findByIdAndRemove(args.id).exec();
        if (!removedUser) {
          throw new "Error!"()
        } else {
          return removedUser
        }
      }
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        profession: { type: GraphQLString }
      },
      resolve(parent, args) {
        const updatedUser = User.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              age: args.age,
              profession: args.profession
            }
          },
          { new: true }
        );
        return updatedUser;
      }
    },
    createPost: {
      type: PostType,
      args: {
        comment: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        let post = new Post({
          comment: args.comment,
          userId: args.userId
        });
        //save to the db
        post.save()
        return post
      }
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        comment: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        return (updatedPost = Post.findByIdAndUpdate(
          args.id,
          {
            $set: {
              comment: args.comment
            }
          },
          { new: true }
        ));
      }
    },
    removePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        let removedPost = UserPost.findByIdAndRemove(args.id).exec();
        if (!removedPost) {
          throw new "Error!"()
        } else {
          return removedPost
        }
      }
    },
    createHobby: {
      type: HobbyType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        let hobby = new Hobby({
          title: args.title,
          description: args.description,
          userId: args.userId
        });
        //save to the db
        hobby.save();
        return hobby;
      }
    },
    updateHobby: {
      type: HobbyType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString }
        // userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        return (updatedHobby = Hobby.findByIdAndUpdate(
          args.id,
          {
            $set: {
              title: args.title,
              description: args.description
            }
          },
          { new: true }
        ));
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
