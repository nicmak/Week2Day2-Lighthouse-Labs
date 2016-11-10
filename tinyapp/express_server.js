const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');//This tells Express app to take EJS as its templating engine
//Setting view engine to ejs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
//
app.get("/urls", (req, res) => { //NOT SURE WHAT THIS DOES
  let templateVars = { urls: urlDatabase };
  //let deleteLink = "urls/:shortURL/delete"
  res.render("urls_index", templateVars)
});
  //Renders a view/ then sends HTML rendered to client
  //first argument, is name of ejs file.
  //urls_index will be passing its data to /urls (client)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //use mounts the middleware function or specified function
// for parsing application/x-www-form-urlencoded
function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i)
  result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
app.post("/urls/create", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  //let prelongURL = req.body.longURL //the variable longURL now has the test.com, website you inputted
let longURL
  if (!req.body.longURL.includes('http://') && !req.body.longURL.includes('https://')) { //https !A & !B == !(A || B) demorgans law
     longURL = "https://" + req.body.longURL

  } else {
     longURL = req.body.longURL
    }
  //let longURL = req.body.longURL
  // //now generate a random six strings, using const might have risk....might use let later
  let shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = longURL; //This will add your new generated shortURL, and assign it with the longURL
  res.redirect('http://localhost:8080/urls/' + shortURL)
  //res.send(`LongURL: ${longURL} ShortURL: ${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
////req.body is the object//////////////////////////
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  longURL: urlDatabase[req.params.id] }; //req.params.id will show the shorten
  //res.render("urls_edit", templateVars);
  res.render("urls_show", templateVars);
  });

app.post("/urls/:id/edit1", (req, res) => {
  urlDatabase[req.params.id]=req.body.longURL
  res.redirect('/urls')
  });
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => { //make a link that goes to this link
  let shortURL = req.params.shortURL; //This would allow me the shorten URL as a variable,
  //console.log(shorURL);
  delete urlDatabase[shortURL]; //shorURL --> "9sm5xK"
  res.redirect('/urls')
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
