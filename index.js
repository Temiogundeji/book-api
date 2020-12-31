const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const {pool} = require('./config');
const multer = require('multer');
// const router = require('express').Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'jpg/png'){
        cb(null, true);
    }
    cb(null, false);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
    fileSize: 1024 * 1024 * 5
}});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('uploads'));

app.use(cors());

app.get('/books', (req, res) => {
    pool.query('SELECT * FROM books returning *', (error, results) => {
        if(error){
            throw error;
        }
        return res.status(200).json(results.rows);
    });
});


app.post('/books', upload.single('bookImage'), (req, res) => {
    const { author, title } = req.body;
    const { path } = req.file;
    console.log(req.file)
    pool.query('INSERT INTO books (author, title, book_img) VALUES ($1, $2, $3)', [author, title, path], (error, results) => {
        if(error){
            throw error;
        }
        res.status(201).json({status: 'success', message: 'Book added.'});
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening');
});