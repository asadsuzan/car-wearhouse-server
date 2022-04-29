const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// set middlewareWrapper
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("welcome to car manager server");
});
app.listen(port, () => {
  console.log("Listenting the port", port);
});
