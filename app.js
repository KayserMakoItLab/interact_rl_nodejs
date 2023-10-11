require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const { createTable, doesTableExist } = require("./db");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT;

const tableName = "report";

doesTableExist(tableName)
  .then((tableExists) => {
    if (tableExists) {
      console.log(`Table '${tableName}' exists.`);
    } else {
      createTable();
    }
  })
  .catch((err) => {
    console.log('err==>', err);
  });


app.use(
  cors({
    origin: "*",
  })
);

app.use("/v1/api", routes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
