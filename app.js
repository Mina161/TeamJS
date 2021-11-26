var express = require("express");
var path = require("path");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.render("login");
});

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  if (await isUser(user)) {
    res.render("home");
  } else res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user);
  created ? res.render("home") : res.render("registration");
});

app.get("/books", function (req, res) {
  res.render("books");
});

app.get("/boxing", function (req, res) {
  res.render("boxing");
});

app.get("/cart", function (req, res) {
  res.render("cart");
});

app.get("/galaxy", function (req, res) {
  res.render("galaxy");
});

app.get("/home", function (req, res) {
  res.render("home");
});

app.get("/iphone", function (req, res) {
  res.render("iphone");
});

app.get("/leaves", function (req, res) {
  res.render("leaves");
});

app.get("/phones", function (req, res) {
  res.render("phones");
});

app.get("/searchresults", function (req, res) {
  res.render("searchresults");
});

app.get("/sports", function (req, res) {
  res.render("sports");
});

app.get("/sun", function (req, res) {
  res.render("sun");
});

app.get("/tennis", function (req, res) {
  res.render("tennis");
});

//App user
var appUser = null;

//Mongodb consts
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://admin:admin@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Mongodb connection
async function conn() {
  await client.connect();
  client.close();
}

//Create user
async function create(user) {
  await client.connect();
  var foundBefore = await client
    .db("projectdb")
    .collection("users")
    .findOne({ username: user.username });
  if (foundBefore === null) {
    await client.db("projectdb").collection("users").insertOne(user);
    appUser = user;
  }
  client.close();
  return foundBefore === null ? true : false;
}

//Login user
async function isUser(user) {
  await client.connect();
  var found = await client.db("projectdb").collection("users").findOne(user);
  client.close();
  if (found !== null) {
    appUser = found._id;
  }
  return found !== null ? true : false;
}

app.listen(3000);
