var express = require("express");
var path = require("path");
const alert = require("alert");
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
    secret: process.env.SECURE_KEY || "hello",
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
  "searchresults"
];

function renderPage(page) {
  app.get(`/${page}`, (req, res) => {
    if (req.session.user === undefined) res.redirect("/");
    else res.render(page);
  });
}
pages.forEach(renderPage);

//POST Requests

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  if (await isUser(user, req.session)) {
    console.log(req.session);
    res.render("home");
  } else {
    res.status(400).send("Wrong username or password");
  }
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user, res, req.session);
  if(created) res.render("home");
});

app.post('/search', async (req, res) => {
  let query = req.body.Search;
  let results = await searchFunction(query);
  res.render('searchresults',{searchResults: results});
})


app.post("/viewCart", async (req, res) => {
  await client.connect();
  const cartItems = await client
    .db("projectdb")
    .collection(req.session.user.username)
    .find({})
    .map((item) => item._id)
    .toArray();
  res.render("cart", { data: cartItems.join(", ") });
  await client.close();
});

//Mongodb consts
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://admin:admin@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const uri =
//   "mongodb+srv://teamjs:Antiquity-Halt-Surfacing0@cluster0.zuszw.mongodb.net/NetworksProject?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Create user
async function create(user, res, session) {
  await client.connect();
  var created = false;
  var foundBefore = await client
    .db("projectdb")
    .collection("users")
    .findOne({ username: user.username });
  if (foundBefore === null && user.password.length !== 0 && user.username.length !== 0) {
    await client
      .db("projectdb")
      .collection("users")
      .insertOne({ ...user});
    await client.db("projectdb").createCollection(user.username);
    session.user = await client.db("projectdb").collection("users").findOne(user);
    session.save();
    created = true;
    await client.close();
  } else if(user.password.length === 0 || user.username.length === 0) {
    res.status(400).send("Username or password cannot be empty");
  } else {
    res.status(400).send("User already exists");
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

async function addToCart(item, res, session) {
  await client.connect();
  try {
    await client
      .db("projectdb")
      .collection(session.user.username)
      .insertOne({ _id: item });
    res.status(200).send(`"${item}" has been added to your cart.`);
  } catch (_) {
    res.status(400).send(`"${item}" is already in your cart.`);
  }
  await client.close();
}

const items = ["boxing", "galaxy", "iphone", "leaves", "sun", "tennis"];
function addButtonEvent(item) {
  app.post(`/${item}ToCart`, async (req, res) => {
    await addToCart(item, res, req.session);
  });
}
items.forEach(addButtonEvent);

//Search for items
async function searchFunction(query){
  await client.connect();
  let results = await client.db('projectdb').collection('items').find({name: {$regex: new RegExp('.*'+query+'.*', 'i')}}).toArray();
  await client.close();
  return results;
}

app.listen(process.env.PORT || 3000);

module.exports = app;
