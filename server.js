'use strict';




// app dependencies

require('dotenv').config();
const express = require('express')
const app = express()
const superagent = require('superagent')
const PORT = process.env.PORT



// view engine to use ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); //for css file 
app.use(express.urlencoded({ extended: true }))

// Home page render
app.get('/', (req, res) => {
  res.render('index');
});


// API routes
app.get('/searches/new', renderForm)
app.post('/searches', renderTheResultPage)



// function

function renderForm(req, res) {
  res.render('pages/searches/new')
}



// constrictor function
let arrayBooks = [];

function Values(title, author, desecration, imageLinks) {
  this.title = title || 'No title available';
  this.author = author || 'no author available';
  this.description = desecration || 'no description available';
  this.imageLinks = imageLinks || 'https://i.imgur.com/J5LVHEL.jpg';
  arrayBooks.push(this)
}



// using form with method post and with this 
// function routes  we send the name: and the value: from my form 
function renderTheResultPage(req, res) {
  // console.log(req.body);
  const search_field = req.body.search_field;
  // console.log(search_field);
  let searchBy = [];
  searchBy.push(req.body.searchBy);
  // console.log(searchBy);
  let url = '';
  let x = 0
  for (let i = 0; i < searchBy.length; i++) {
    if (searchBy[i] === 'Title' || searchBy[i] === 'Author') {
      url = `https://www.googleapis.com/books/v1/volumes?q=${search_field}+${searchBy[i]}` //stolen from my team
      console.log(`https://www.googleapis.com/books/v1/volumes?q=${search_field}+${searchBy[i]}`);
      break;
    } else {
      url = `https://www.googleapis.com/books/v1/volumes?q=${search_field}+${searchBy[i]}` //stolen from my team
      break;
    }
  }

  superagent.get(url).then(result => {;
    let myBook = result.body.items
    myBook.forEach(object => {
      // if (object.volumeInfo.imageLinks === true) {
      //   new Values(object.volumeInfo.title, object.volumeInfo.authors.join(' and '), object.volumeInfo.description, object.volumeInfo.imageLinks.smallThumbnail)
      // } else {

      let image = '';
      if (object.volumeInfo.imageLinks) {
        image = object.volumeInfo.imageLinks.smallThumbnail
      } else {
        image = 'https://i.imgur.com/J5LVHEL.jpg'
      }

      let author;
      if (typeof(object.volumeInfo.authors) === 'array') {
        author = object.volumeInfo.authors.join(' and ')
      } else {
        author = object.volumeInfo.authors
      }
      new Values(object.volumeInfo.title, author, object.volumeInfo.description, image)
        // }

    });

    res.render('pages/searches/show', { TheBook: arrayBooks })
  })
}

// function notFoundHandler(request, response) {
//   response.status(404).sendFile('./error', { root: './pages' })
// }

// function errorHandler(err, request, response, next) {
//   response.status(500).render('pages/error');
// }
app.get('*', (req, res) => { res.status(404).send('Page Not Found gg man') })
app.listen(PORT, () => console.log(`Mosab app Running on ${PORT}`))