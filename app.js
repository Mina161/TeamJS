var express = require("express");
var path = require("path");
var alerts = require("alert");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(sessions({
    secret: process.env.SECURE_KEY,
    saveUninitialized:true,
    cookie: { maxAge: 1000*60*60*6 },
    resave: false 
}));

var thisSession;

//GET Requests
app.get("/", function (req, res) {
  res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.get("/books", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("books");
});

app.get("/boxing", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("boxing");
});

app.get("/cart", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("cart", { cart: thisSession.user.cart });
});

app.get("/galaxy", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("galaxy");
});

app.get("/home", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("home");
});

app.get("/iphone", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("iphone");
});

app.get("/leaves", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("leaves");
});

app.get("/phones", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("phones");
});

app.get("/searchresults", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("searchresults");
});

app.get("/sports", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("sports");
});

app.get("/sun", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("sun");
});

app.get("/tennis", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("tennis");
});

//POST Requests

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  thisSession = req.session;
  if (await isUser(user)) {
    thisSession.user = user.username;
    res.render("home");
  } else res.render("login");
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user);
  created ? res.render("home") : res.render("registration");
});

app.post("/boxing", async function (req, res) {
  added = await addToCart({ name: "Boxing Bag", ref: "boxing" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/galaxy", async function (req, res) {
  added = await addToCart({ name: "Galaxy S21 Ultra", ref: "galaxy" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/iphone", async function (req, res) {
  added = await addToCart({ name: "iPhone 13 Pro", ref: "iphone" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/leaves", async function (req, res) {
  added = await addToCart({ name: "Leaves of Grass", ref: "leaves" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/sun", async function (req, res) {
  added = await addToCart({ name: "The Sun and Her Flowers", ref: "sun" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/tennis", async function (req, res) {
  added = await addToCart({ name: "Tennis Racket", ref: "tennis" });
  if(added) res.render("cart", { cart: thisSession.user.cart });
});

app.post("/search", async function (req, res) {
  var results = await search(req.body.Search);
  res.render("searchresults", { results: results });
});

//Mongodb consts
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://admin:"+process.env.DBPASS+"@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create user
async function create(user) {
  await client.connect();
  var foundBefore = await client
    .db("projectdb")
    .collection("users")
    .findOne({ username: user.username });
  if (foundBefore === null) {
    await client
      .db("projectdb")
      .collection("users")
      .insertOne({ ...user, cart: [] });
    thisSession.user = await client.db("projectdb").collection("users").findOne(user);
  }
  return foundBefore === null ? true : false;
}

//Login user
async function isUser(user) {
  await client.connect();
  thisSession.user = await client.db("projectdb").collection("users").findOne(user);
  console.log(thisSession.user);
  return thisSession.user !== null ? true : false;
}

//Update Cart
async function addToCart(item) {
  cart = thisSession.user.cart;
  if (inCart(item)) {
    alerts("Item already in cart")
    return false;
  } else {
    await client.connect();
    cart.push(item);
    await client
      .db("projectdb")
      .collection("users")
      .updateOne({ _id: thisSession.user._id }, { $set: { cart: cart } });
    await client.close();
    thisSession.user.cart = cart;
    return true;
  }
}

//Check cart
function inCart(item) {
  const cart = thisSession.user.cart;
  const included = (element) => element.name === item.name;
  return cart.some(included);
}

//Search for items
async function search(query) {
  await client.connect();
  var string = ".*" + query + ".*";
  var results = await client
    .db("projectdb")
    .collection("items")
    .find({ name: new RegExp(string, "i") })
    .toArray();
  await client.close();
  return results;
}

app.listen(process.env.PORT || 3000);
