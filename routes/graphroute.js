const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphqlSchema = require("../graphSchema/graphSchema");
const router = express.Router();

router.use(
  "/api",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: global,
    graphiql: true
  })
);

module.exports = router;
