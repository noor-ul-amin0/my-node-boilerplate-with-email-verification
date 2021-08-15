const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const AppError = require("./utils/AppError");
require("./db/connection");
const app = express();

//========================================================================================================================
// EPXRESS AND OTHER MIDDLEWARES INITALIZATION
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use(express.static("public"));

app.use("/api/auth", require("./routes/auth"));
//========================================================================================================================
// MIDDLEWARE FOR INVALID ROUTES
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server.`, 404));
});
//========================================================================================================================
// SPECIAL MIDDLEWARE FOR ERROR HANDLING
app.use(ErrorHandler);
//========================================================================================================================
const PORT = process.env.PORT || 4001;
app.listen(PORT, console.log(`server is running at port ${PORT}`));

function ErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.success = err.success || false;
  res.status(err.statusCode).json({
    success: err.success,
    error: err,
    msg: err.message,
    // stack: err.stack,
  });
}
