require('dotenv').config();

const express = require('express');
const app = express();

// connect to mongodb
const connectDB = require('./connectDB/connect');

const morgan = require('morgan');
const Blog = require('./models/monoBlog');



// register view engine
app.set('view engine', 'ejs');

// to use static files like css and imgs
app.use(express.static("public"));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/blogs', (req, res) => {
    Blog.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('index', { title: 'All blogs', blogs: result });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/blogs/create', (req, res) => {
    res.render('create', { title: 'Create a new blog' });
});

app.post('/blogs', (req, res) => {
    console.log(req.body);
    const blog = new Blog(req.body);

    blog.save()
        .then(result => {
            res.redirect('/blogs');
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/blogs/:id', (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
        .then(result => {
            res.render('details', { blog: result, title: 'Blog Details' });
        })
        .catch(err => {
            console.log(err);
        });
});

app.delete('/blogs/:id', (req, res) => {
    const id = req.params.id;
    
    Blog.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/blogs' });
        })
        .catch(err => {
            console.log(err);
        });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.dbURI);
        app.listen(port, () => console.log(`Server listening on port ${port}...`));
    } catch (err) {
        console.log(err);
    }
}

start();