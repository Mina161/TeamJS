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

app.use(
  sessions({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SECURE_KEY,
  })
);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

const pages = [
  "books",
  "boxing",
  "galaxy",
  "home",
  "iphone",
  "leaves",
  "phones",
  "sports",
  "sun",
  "tennis",
];

function renderPage(page) {
  app.get(`/${page}`, (req, res) => {
    if (req.session.user === null) res.render("login");
    res.render(page);
  });
}

app.get("/cart", function (req, res) {
  if (req.session.user === null) res.render("login");
  res.render("cart", { cart: req.session.user.cart });
});

pages.forEach(renderPage);

//POST Requests

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  if (await isUser(user, req.session)) {
    console.log(req.session);
    res.render("home");
  } else {
    alert("Wrong username or password")
  }
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user);
  created ? res.render("home") : res.render("registration");
});

app.post("/boxing", async function (req, res) {
  added = await addToCart({ name: "Boxing Bag", ref: "boxing" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post("/galaxy", async function (req, res) {
  added = await addToCart({ name: "Galaxy S21 Ultra", ref: "galaxy" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post("/iphone", async function (req, res) {
  added = await addToCart({ name: "iPhone 13 Pro", ref: "iphone" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post("/leaves", async function (req, res) {
  added = await addToCart({ name: "Leaves of Grass", ref: "leaves" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post("/sun", async function (req, res) {
  added = await addToCart({ name: "The Sun and Her Flowers", ref: "sun" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post("/tennis", async function (req, res) {
  added = await addToCart({ name: "Tennis Racket", ref: "tennis" },req.session);
  if(added) res.render("cart", { cart: req.session.user.cart });
});

app.post('/search', async (req, res) => {
  let query = req.body.Search;
  let results = await searchFunction(query);
  res.render('searchresults',{searchResults: results});
})

//Mongodb consts
const { MongoClient } = require("mongodb");
const alert = require("alert");
const uri =
  "mongodb+srv://admin:admin@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create user
async function create(user, session) {
  await client.connect();
  var created = false;
  var foundBefore = await client
    .db("projectdb")
    .collection("users")
    .findOne({ username: user.username });
  if (foundBefore === null && user.password.length !== 0) {
    await client
      .db("projectdb")
      .collection("users")
      .insertOne({ ...user, cart: []});
    session.user = await client.db("projectdb").collection("users").findOne(user);
    session.save();
    created = true;
    await client.close();
  } else if(user.password.length === 0) {
    alert("Password cannot be empty")
  } else {
    alert("User already exists")
  }
  return created
}

//Login user
async function isUser(user, session) {
  await client.connect();
  session.user = await client.db("projectdb").collection("users").findOne(user);
  session.save();
  await client.close();
  return session.user !== null ? true : false;
}

//Update Cart
async function addToCart(item, session) {
  cart = session.user.cart;
  if (inCart(item, session)) {
    alerts("Item already in cart")
    return false;
  } else {
    await client.connect();
    cart.push(item);
    await client
      .db("projectdb")
      .collection("users")
      .updateOne({ _id: session.user._id }, { $set: { cart: cart } });
    await client.close();
    session.user.cart = cart;
    session.save();
    return true;
  }
}

//Check cart
function inCart(item, session) {
  const cart = session.user.cart;
  const included = (element) => element.name === item.name;
  return cart.some(included);
}

//Search for items
async function searchFunction(query){
  await client.connect();
  let results = await client.db('projectdb').collection('items').find({name: {$regex: new RegExp('.*'+query+'.*', 'i')}}).toArray();
  await client.close();
  return results;
}

app.listen(process.env.PORT || 3000);

module.exports = app;
