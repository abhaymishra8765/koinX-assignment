const express = require('express');
const multer = require('multer');
const connectDB = require('./db');
const tradeController = require('./tradeController');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json()); // Middleware to parse JSON bodies

// Connect to the database
connectDB();

// Define the upload route
app.post('/upload', upload.single('file'), tradeController.uploadFile);

// Define the balance calculation route
app.post('/balance', tradeController.getBalance);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
