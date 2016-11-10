var string = "www.google.ca"
//console.log(string)
if (!string.includes('http://')) {
  const newString = "http://" + string
  console.log("newstring:",newString);
} else {
  console.log("else:",string)
}
