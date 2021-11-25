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
  res.render("index", { title: "Mina's Server" });
});

app.get("/network", function (req, res) {
  res.render("network", { network: "CSEN 503" });
});

app.post("/network", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  console.log(username);
  console.log(password);
  res.render("index", {title: "submitted"})
})

app.listen(3000);
