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

let thisSession;
app.use(
  sessions({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECURE_KEY || "hihello",
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
  "searchresults",
  "sports",
  "sun",
  "tennis",
];

function renderPage(page) {
  app.get(`/${page}`, (_, res) => {
    if (thisSession.user === null) res.render("login");
    res.render(page);
  });
}

app.get("/cart", function (req, res) {
  if (thisSession.user === null) res.render("login");
  res.render("cart", { cart: thisSession.user.cart });
});

pages.forEach(renderPage);

//POST Requests

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  thisSession = req.session;
  if (await isUser(user)) {
    console.log(thisSession);
    res.render("home");
  } else res.render("login");
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user, req.session);
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

app.post('/search', async (req, res) => {
  let query = req.body.Search;
  let results = await searchFunction(query);
  res.render('searchresults',{searchResults: results});
})

//Mongodb consts
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://admin:admin@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create user
async function create(user, session) {
  await client.connect();
  var foundBefore = await client
    .db("projectdb")
    .collection("users")
    .findOne({ username: user.username });
  if (foundBefore === null) {
    await client
      .db("projectdb")
      .collection("users")
      .insertOne({ ...user, cart: []});
      await client
      .db("projectdb")
      .collection("sessions")
      .insertOne({userName: user.username, userSess: session});
    thisSession.user = await client.db("projectdb").collection("users").findOne(user);
  }
  return foundBefore === null ? true : false;
}

//Login user
async function isUser(user) {
  await client.connect();
  thisSession = await client.db("projectdb").collection("sessions").findOne({userName: user.username});
  thisSession.user = await client.db("projectdb").collection("users").findOne(user);
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
async function searchFunction(query){
  await client.connect();
  let results = await client.db('projectdb').collection('items').find({name: {$regex: new RegExp('.'+query+'.', 'i')}}).toArray();
  await client.close();
  return results;
}

app.listen(process.env.PORT || 3000);

module.exports = app;
