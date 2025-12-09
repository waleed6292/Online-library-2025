// This code works with Mongoose v7+

var express = require("express");
const { default: mongoose } = require("mongoose");
const connectDB = require('./MongoDBConnect');
let Books = require('./BooksSchema');

const cors = require('cors');

console.log("Backend Server Initializing...");

var app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

console.log("Books Model Loaded:", Books);

// Default Route
app.get('/', function (req, res) {
    res.send("Backend API is running");
});

// About Route (example)
app.get('/about', function (req, res) {
    res.send("MongoDB Express React Node (MERN) Library App Backend");

    Books.countDocuments().exec()
        .then(count => console.log("Total books in database:", count))
        .catch(err => console.error(err));
});

// -----------------------------------------------
// ------------ CRUD ROUTES BELOW ----------------
// -----------------------------------------------

// 1. Display ALL Books
app.get('/allbooks', async (req, res) => {
    const allBooks = await Books.find();
    return res.json(allBooks);
});

// 2. Display a single book by ID
app.get('/getbook/:id', async (req, res) => {
    let id = req.params.id;
    let book = await Books.findById(id);

    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// 3. Add a new book
app.post('/addbooks', function (req, res) {
    let newbook = new Books(req.body);

    newbook.save()
        .then(() => {
            res.status(200).json({ message: 'Book added successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Adding new book failed');
        });
});

// 4. Update a book
app.post('/updatebook/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const update = {
            booktitle: req.body.booktitle,
            PubYear: req.body.PubYear,
            author: req.body.author,
            Topic: req.body.Topic,
            formate: req.body.formate
        };

        const updatedBook = await Books.findByIdAndUpdate(
            id,
            { $set: update },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book updated successfully',
            book: updatedBook
        });

    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update book', details: err.message });
    }
});

// 5. Delete a book
app.post('/deleteBook/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const deletedBook = await Books.findByIdAndDelete(id);

        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).send('Book Deleted');

    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete book', details: err.message });
    }
});

// -----------------------------------------------
// ---- START SERVER AFTER DB CONNECTION ---------
// -----------------------------------------------
(async () => {
    await connectDB();
    app.listen(5000, () => console.log('✅ Server running on port 5000'));
})();
