const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
require("dotenv").config()

const cors = require('cors')
const port = process.env.PORT || 4000
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PASS

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0-jolc9.mongodb.net/test?retryWrites=true&w=majority`,
  { useUnifiedTopology: true, useNewUrlParser: true }
);

mongoose.connection.once("open", () => {
  console.log("Yes we are connected!");
});

// instantiate express
const app = express()

app.use(cors())

app.use('/graphql', graphqlHTTP({
  graphiql: true,
  schema: schema
}))
app.listen(port, ()=> {
  console.log(`Listening for requests on port ${port}.`);
  
})

