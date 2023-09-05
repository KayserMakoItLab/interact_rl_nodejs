require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT;

app.use(
  cors({
    origin: "*",
  })
);

app.use("/v1/api", routes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
