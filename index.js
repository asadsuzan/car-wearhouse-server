const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// set middlewareWrapper
app.use(cors());
app.use(express.json());

// conection strin
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o7mmp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// conect to db
async function run() {
  try {
    await client.connect();
    const carCollections = client.db("managcar").collection("cars");

    //   update stokes by id
    app.put("/cars/home/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          ...updatedItem,
        },
      };
      const result = await carCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send({ success: "updated" });
    });

    // get single car by id
    app.get("/cars/home/:id", async (req, res) => {
      const id = req.params.id;
      const car = await carCollections.findOne({ _id: ObjectId(id) });
      res.send(car);
    });

    // get limited cars
    app.get("/cars/home", async (req, res) => {
      const query = {};
      const cursor = carCollections.find(query);
      const cars = await cursor.limit(6).toArray();
      res.send(cars);
    });
  } finally {
  }
}
run().catch(console.dir);

// home route
app.get("/", (req, res) => {
  res.send("welcome to car manager server");
});

app.listen(port, () => {
  console.log("Listenting the port", port);
});
