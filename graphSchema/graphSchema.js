const { GraphQLSchema, GraphQLString, GraphQLObjectType, GraphQLList } = require("graphql");

//News Model
const { News } = require("../models/News");

//NEWS
const NewsQuery = new GraphQLObjectType({
  name: "NewsQuery",
  fields: {
    title: {
      type: GraphQLString
    },
    publishedAt: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    url: {
      type: GraphQLString
    },
    urlToImage: {
      type: GraphQLString
    },
    source: {
      type: GraphQLString
    },
    tag: {
      type: GraphQLString
    }
  }
});

//APPLICATION DEVELOPERS
const AppDevelopers = new GraphQLObjectType({
  name: "Developers",
  fields: {
    company: {
      type: GraphQLString,
      resolve: () => "Ancla Technologies"
    }
  }
});

//APPLICATION DETAILS
const AppDetails = new GraphQLObjectType({
  name: "AppDetails",
  fields: {
    appname: {
      type: GraphQLString,
      resolve: () => "iBrandTv Mobile"
    },
    version: {
      type: GraphQLString,
      resolve: () => "1.0.0"
    },
    developers: {
      type: AppDevelopers,
      resolve: () => AppDevelopers
    }
  }
});

//ROOT QUERY
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    others: {
      type: new GraphQLList(NewsQuery),
      resolve: () => News.find({ tag: { $not: { $regex: "^ibrand$" } } }).sort({ _id: -1 })
    },
    ibrand: {
      type: new GraphQLList(NewsQuery),
      resolve: () => News.find({ tag: "ibrand" }).sort({ _id: -1 })
    },
    appdetails: {
      type: AppDetails,
      resolve: () => AppDetails
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
