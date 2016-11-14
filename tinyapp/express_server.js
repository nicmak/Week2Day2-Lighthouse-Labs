var express = require("express");
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
var app = express();
const lengths = 6
const chars ='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['random'],
  maxAge: 60 * 60 * 1000 // 1 hour cookie life
}))
// THIS OWNURL FUNCTION ALLOWS THE USER TO FIND THEIR URLS ONCE THEY LOG OUT AND LOG BACK IN
const ownURL = function(userEmail) {
  let ownDatabase = {}
  for (var key in urlDatabase) {
    if (urlDatabase[key]["email"] === userEmail) {
      ownDatabase[key] = urlDatabase[key]["url"];
    }
  }
  return ownDatabase;
}
//THIS FUNCTION GENERATES A RANDOMSTRING ASSIGNED FOR USERID
function generateRandomString(length, char) {
  let result = '';
  for (let i = length; i > 0; --i)
  result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const userDatabase = {}; //EMPTY OBJECT USED TO STORE USER INFORMATION ONCE THEY REGISTER

var urlDatabase = { //DATABASE THAT STORES THE URLS THAT THE USER SAVED...THIS IS JUST TEST DATA
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    email: "sam@gmail.com"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    email: "sam@gmail.com"
  }
};
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//----------------------REGISTRATION SECTION---------------------------
app.get("/register", (req, res) => {
  res.render("urls_regis");
});
app.post("/register", (req, res) => {
  // check for fields
  if (!req.body.email || !req.body.password) {//)
    res.status(400).send("400 Error has occured");
  }
  // check if user exists
  for ( var key in userDatabase) {
    if (userDatabase[key].email === req.body.email) {
      res.status(400).send("400 User Already Exists");
    }
  }
  //  create user
  let hash_password = bcrypt.hashSync(req.body.password, 10);
  var user = {
    id: generateRandomString(lengths, chars),
    email: req.body.email,
    password: hash_password
  }
  userDatabase[user.id] = user;
  console.log(userDatabase); //THIS STORES USER DATA INTO USERDATABASE, CONSOLE.LOG ALLOWS YOU TO SEE EASILY WHAT IS BEING STORED IN TERMINAL
  req.session.email=req.body.email;
  res.redirect("/urls/new");
});
//-----------------------LOGOUT AND LOGIN MIDDLEWARE----------------------
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  for (var key in userDatabase) {
    if ((userDatabase[key].email === req.body.email) && (bcrypt.compareSync(req.body.password,userDatabase[key].password))) {
      req.session.email = req.body.email;
      res.redirect("/urls/new");
    } else {
      res.status(403).send("403 Error has occured");
    }
  }
})
// -------------THIS MIDDLEWARE GIVES USER THE ABILITY TO ADD NEW URLS
app.get("/urls/new", (req, res) => {
  let templateVars = {
    email: req.session.email
  };
  res.render("urls_new", templateVars);
});

//THIS IS THE HOME PAGE THAT PROVIDES USER'S LIST OF OWN URL
app.get("/urls", (req, res) => {
  let templateVars = { urls: ownURL(req.session.email),
    email:req.session.email
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    URL: urlDatabase[req.params.id]["url"],
    email: req.session.email
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["url"];
  res.redirect(longURL);
});
// ------THIS MIDDLEWARE CHECKS IF THE URL THAT USER INPUTTED IS VALID, THEN STORES THEM IN URLDATABASE
app.post("/urls/create", (req, res) => {
let longURL
  if (!req.body.longURL.includes('http://') && !req.body.longURL.includes('https://')) { //https !A & !B == !(A || B) demorgans law
     longURL = "https://" + req.body.longURL;
  } else {
     longURL = req.body.longURL;
    }
  let shortURL = generateRandomString(lengths, chars);
  urlDatabase[shortURL] = {
    url: longURL,
    email: req.session.email
  }
  res.redirect('http://localhost:8080/urls/' + shortURL)
});

app.post("/urls/:id", (req, res) => {
  if (!req.body.longURL.includes('http://') && !req.body.longURL.includes('https://')) { //https !A & !B == !(A || B) demorgans law
     longURL = "https://" + req.body.longURL;
  } else {
     longURL = req.body.longURL;
    }
  urlDatabase[req.params.id]["url"]=longURL
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
