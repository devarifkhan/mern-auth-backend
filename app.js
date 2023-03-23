const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
require("./db");
const userRouter = require("./routes/user");
const {errorHandler} = require("./middlewares/error");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);

app.use(errorHandler);

app.get("/about", (req, res) => {
  res.send("<h1>About Page</h1>");
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
