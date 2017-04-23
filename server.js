var http = require("http");
var fs = require("fs");
var bodyParser = require('body-parser');
var express = require('express');

var app = express();

var user;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/user", function(req, res) {
    res.send(user);
});

app.post("/login", function(req, res) {
    var users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf8"));
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === req.body.username && users[i].password === req.body.password) {
            user = users[i];
            break;
        }
    }

    if (user === undefined) {
        res.status(401).end();
    }
    else {
        res.send(user);
    }
});

app.post("/logout", function(req, res) {
    user = undefined;
    res.end();
});

app.post("/userSettings", function(req, res) {
    var users = JSON.parse(fs.readFileSync(__dirname + "/users.json", "utf8"));
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === user.id) {
            if (users[i].password === req.body.currentPassword) {
                if (req.body.newPassword !== req.body.confirmNewPassword) {
                    res.status(409).end();
                    return;
                }
                users[i].name = req.body.name;
                users[i].password = req.body.newPassword;
                user = users[i];
                break;
            }
            else {
                res.status(401).end();
                return;
            }
        }
    }
    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users), "utf8");
    res.end();
});

app.post("/addAuthor", function(req, res) {
    var authors = JSON.parse(fs.readFileSync(__dirname + "/authors.json", "utf8"));
    for (var i = 0; i < authors.length; i++) {
        if (authors[i].name === req.body.name) {
            res.status(409).end();
            return;
        }
    }
    var id = authors.length + 1;
    var author = {"id": id, "name": req.body.name};
    authors.push(author);
    fs.writeFileSync(__dirname + "/authors.json", JSON.stringify(authors), "utf8");
    res.end();
});

app.get("/authors", function(req, res) {
    var authors = JSON.parse(fs.readFileSync(__dirname + "/authors.json", "utf8"));
    res.send(authors);
});

app.get("/genres", function(req, res) {
    var genres = JSON.parse(fs.readFileSync(__dirname + "/genres.json", "utf8"));
    res.send(genres);
});

app.post("/addBook", function(req, res) {
    var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
    for (var i = 0; i < books.length; i++) {
        if (books[i].author === req.body.author.name && books[i].title === req.body.title) {
            res.status(409).end();
            return;
        }
    }
    var id = books.length + 1;
    var book = {"id": id, "author": req.body.author.name, "title": req.body.title, "genre": req.body.genre, "quantity": 0, "available": 0};
    books.push(book);
    fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
    res.end();
});

app.post('/addBookInstance/:bookID/:quantity', function (req, res) {
    var bookID = parseInt(req.params.bookID);
    var quantity = parseInt(req.params.quantity);
    if (isNaN(quantity) || quantity < 0) {
        res.status(409).end();
        return;
    }
    var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === bookID) {
            books[i].quantity += quantity;
            books[i].available += quantity;
            break;
        }
    }
    fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
    res.end();
});

app.get("/books", function(req, res) {
    var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
    res.send(books);
});

app.post("/requestBook/:bookID", function (req, res) {
    var bookID = parseInt(req.params.bookID);
    var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
    var book;
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === bookID) {
            book = books[i];
            break;
        }
    }
    var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
    var id = 1;
    for (var i = 0; i < requests.length; i++) {
        if (requests[i].id >= id) {
            id = requests[i].id + 1;
        }
    }
    var request = {"id": id, "author": book.author, "title": book.title, "user": user.username};
    requests.push(request);
    fs.writeFileSync(__dirname + "/requests.json", JSON.stringify(requests), "utf8");
    res.end();
});

app.get("/requests", function(req, res) {
    var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
    res.send(requests);
});

app.post("/lendBook", function(req, res) {
    var books = JSON.parse(fs.readFileSync(__dirname + "/books.json", "utf8"));
    var requests = JSON.parse(fs.readFileSync(__dirname + "/requests.json", "utf8"));
    for (var i = 0; i < books.length; i++) {
        if (books[i].author === req.body.author && books[i].title === req.body.title) {
            if (books[i].available === 0) {
                res.status(409).end();
                return;
            } else {
                books[i].available--;
            }
            break;
        }
    }
    for (var i = 0; i < requests.length; i++) {
        if (requests[i].id === req.body.id) {
            requests.splice(i, 1);
        }
    }
    fs.writeFileSync(__dirname + "/books.json", JSON.stringify(books), "utf8");
    fs.writeFileSync(__dirname + "/requests.json", JSON.stringify(requests), "utf8");
    res.end();
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Librarian app listening at http://%s:%s", host, port);
});
