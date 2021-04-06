'use strict';

// app dependencies

require('dotenv').config();

const express = require('express')
const app = express()

const methodoverride = require('method-override');
app.use(methodoverride('_method'));
const superagent = require('superagent')

const PORT = process.env.PORT
  // const cors = require('cors');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('Erroe', err => console.log('pg problem', err));

// view engine to use ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); //for css file 
app.use(express.urlencoded({ extended: true }))

// Home page render
app.get('/', (req, res) => {
  let SQL = 'SELECT * FROM  books;';
  client.query(SQL)
    .then(data => {
      console.log('data.rows', data.rows)
      res.render('pages/index', { data: data.rows, total: data.rowCount })

    }).catch(err => console.log(err))
});


// API routes
app.get('/books/details/:id', handelSingularBook)
app.put('/books/details/:id', update)
app.delete('/books/details/:id', myDelete)

app.get('/searches/new', renderForm)
app.post('/searches', renderTheResultPage)
app.post('/', mainPost)


function handelSingularBook(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1';
  let ids = req.params.id;
  client.query(SQL, [ids]).then(response => {
    let result = response.rows[0];
    res.render('pages/searches/detail', { data: result })
  })

}

function update(request, response) {
  let id = request.params.id
  console.log(request.body);
  let SQL = 'UPDATE books SET author=$1, title=$2, image_url=$3, description=$4 WHERE id=$5';
  const { author, title, image_url, description } = request.body
  let values = [author, title, image_url, description, id]
  client.query(SQL, values)
    .then(data => {
      console.log('mydata', data.rows);
      response.redirect(`/books/details/${id}`);
    })
}

function myDelete(request, response) {
  let id = request.params.id
  let SQL = 'DELETE FROM books WHERE id=$1'
  client.query(SQL, [id]).then(data => {
    response.redirect('/')
  })

}









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
  const search_field = req.body.search_field;
  let searchBy = [];
  searchBy.push(req.body.searchBy);
  let url = '';

  for (let i = 0; i < searchBy.length; i++) {
    if (searchBy[i] === 'Title' || searchBy[i] === 'Author') {
      url = `https://www.googleapis.com/books/v1/volumes?q=${search_field}+${searchBy[i]}` //stolen from my team

      break;
    } else {
      url = `https://www.googleapis.com/books/v1/volumes?q=${search_field}+${searchBy[i]}` //stolen from my team
      break;
    }
  }

  superagent.get(url).then(result => {;
    let myBook = result.body.items
    myBook.forEach(object => {

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
    });

    res.render('pages/searches/show', { TheBook: arrayBooks })
  })
}

function mainPost(request, response) {
  let input = request.body.dasArray
  let values = [input[0], input[1], input[2], input[3]]
  let SQL = 'INSERT INTO books(image_url,title,author,description)VALUES($1,$2,$3,$4) RETURNING *'
  client.query(SQL, values)
    .then(table => {
      // console.log(table.rows[0].id);
      let rowContent = table.rows[0].id
      response.redirect(`/books/details/${rowContent}`)
    })
}

app.use('*', notFoundHandler); // 404 not found url
app.use(errorHandler);

function notFoundHandler(request, response) {
  response.status(404).sendFile('./error', { root: './pages' })
}

function errorHandler(err, request, response, next) {
  response.status(500).render('pages/error');
}
app.get('*', (req, res) => { res.status(404).send('Page Not Found gg man') })

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Mosab app Running on ${PORT}`))
  })