const express = require("express");
const jwt = require("jsonwebtoken");
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

    // for jwt
    app.post("/signin", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN);
      res.send({ token: token });
    });

    // get items by author
    app.get("/cars/myitems", async (req, res) => {
      const author = req.query.author;
      const accessToken = req.query.access_token;
      const cursor = carCollections.find({ author });
      const result = await cursor.toArray();
      //  verify token
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
        if (author === decoded.email) {
          res.send(result);
        }
      } catch (err) {
        res.send({ message: 403 });
      }
    });

    // add items
    app.post("/cars/all", async (req, res) => {
      const newItem = req.body;
      const result = await carCollections.insertOne(newItem);
      res.send({ messege: "item added successfull" });
    });

    // delet item by id
    app.delete("/cars/all/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carCollections.deleteOne({ _id: ObjectId(id) });
      res.send({ delete: "success" });
    });

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
      // const cars = await cursor.limit(6).toArray();
      const cars = await cursor.toArray();
      console.log(cars);
      res.send(cars.reverse().slice(0, 6));
    });
    // get all cars
    app.get("/cars/all", async (req, res) => {
      const query = {};
      const cursor = carCollections.find(query);
      const cars = await cursor.toArray();
      res.send(cars);
    });
  } finally {
    // for close
  }
}
run().catch(console.dir);

// home route
app.get("/", (req, res) => {
  res.send("welcome to car manager server");
});

app.listen(port, () => {
  console.log("LISTENING TO PORT", port);
});
