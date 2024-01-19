const express = require('express');
const { PORT = 3000 } = process.env;
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/users');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter);

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('MongoDB connected');
  });

app.listen(PORT, () => {
  console.log('Server started on port 3000');
});