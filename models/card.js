const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Заполните поле'],
    minlength: [2, 'Минимальная длина поля - 2 символа'],
    maxlength: [30, 'Максимальная длина поля - 30 символов'],
  },
  link: {
    type: String,
    required: [true, 'Заполните поле'],
  },
  owner: {
    type: ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [
    {
      type: ObjectId,
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardSchema);
