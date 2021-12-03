var express = require("express");
var path = require("path");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


//GET Requests
app.get("/", function (req, res) {
  res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.get("/books", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("books");
});

app.get("/boxing", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("boxing");
});

app.get("/cart", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("cart", {cart: appUser.cart});
});

app.get("/galaxy", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("galaxy");
});

app.get("/home", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("home");
});

app.get("/iphone", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("iphone");
});

app.get("/leaves", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("leaves");
});

app.get("/phones", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("phones");
});

app.get("/searchresults", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("searchresults");
});

app.get("/sports", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("sports");
});

app.get("/sun", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("sun");
});

app.get("/tennis", function (req, res) {
  if (appUser === null) res.render("login");
  res.render("tennis");
});

//POST Requests

app.post("/", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  if (await isUser(user)) {
    res.render("home");
  } else res.render("login");
});

app.post("/register", async function (req, res) {
  var user = { username: req.body.username, password: req.body.password };
  var created = await create(user);
  created ? res.render("home") : res.render("registration");
});

app.post("/boxing", async function (req, res) {
  await addToCart({name:"Boxing Bag", ref:"boxing"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/galaxy", async function (req, res) {
  await addToCart({name:"Galaxy S21 Ultra", ref:"galaxy"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/iphone", async function (req, res) {
  await addToCart({name:"iPhone 13 Pro", ref:"iphone"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/leaves", async function (req, res) {
  await addToCart({name:"Leaves of Grass", ref:"leaves"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/sun", async function (req, res) {
  await addToCart({name:"The Sun and Her Flowers", ref:"sun"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/tennis", async function (req, res) {
  await addToCart({name:"Tennis Racket", ref:"tennis"})
  res.render("cart", {cart: appUser.cart})
});

app.post("/search", async function(req,res){
  var results = await search(req.body.Search);
  res.render("searchresults",{results: results})
})

//App user and details
var appUser = null;

//Mongodb consts
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://admin:admin@cluster0.hjoec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
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
    await client.db("projectdb").collection("users").insertOne({...user, cart: []});
    appUser = await client.db("projectdb").collection("users").findOne(user);
  }
  return foundBefore === null ? true : false;
}

//Login user
async function isUser(user) {
  await client.connect();
  appUser = await client.db("projectdb").collection("users").findOne(user);
  console.log(appUser)
  return appUser !== null ? true : false;
}

//Update Cart
async function addToCart(item) {
  await client.connect();
  cart = appUser.cart;
  cart.push(item);
  await client.db("projectdb").collection("users").updateOne({_id: appUser._id}, { $set: {cart: cart } });
  await client.close();
  appUser.cart = cart;
}

//Search for items
async function search(query){
  await client.connect();
  var string = ".*"+query+".*"
  console.log(string)
  var results = await client.db("projectdb").collection("items").find({name: new RegExp(string,'i')}).toArray();
  await client.close();
  console.log(results);
  return results;
}

app.listen(3000);
