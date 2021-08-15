const mongoose = require("mongoose");

require("dotenv").config();

// db connection
const uri =
  process.env.NODE_ENV === "development"
    ? process.env.MONGODB_DEV_URI.replace(
        "<password>",
        process.env.DEV_DATABASE_PASSWORD
      )
    : process.env.MONGODB_PROD_URI.replace(
        "<password>",
        process.env.PROD_DATABASE_PASSWORD
      );
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(async (conn) => {
    console.log(`Connected to MongoDB ${conn.connection.host}`);
  })
  .catch((err) => console.log(err));
