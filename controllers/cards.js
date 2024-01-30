const Card = require('../models/card');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => { res.status(SERVER_ERROR).send({ message: 'Ошибка на сервере' }); });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id  })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
        return;
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(() => {
      next(new NotFoundError('Карточка по данному id не найдена'));
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка по данному id не найдена');
      }
      if (card.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Вы не можете удалять чужие карточки'));
        return;
      }

      Card.findByIdAndDelete(cardId).then(() => res.send({ message: 'Карточка удалена' })).catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный id карточки'));
        return;
      }
      next(err);
    });
};

module.exports.likedCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => {
    next(new NotFoundError({message: 'Карточка по данному id не найдена'}));
  })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        next(new NotFoundError({ message: 'Передан несуществующий _id карточки' }));
        return;
      }
      if (err.name === 'CastError') {
        next(new BadRequestError({ message: 'Карточка по данному id не найдена'}));
        return;
      }
      next(err);
    });
};

module.exports.dislikedCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => {
    next(new NotFoundError('Карточка по данному id не найдена'));
  })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError({ message:'Неправильный id карточки' }));
        return;
      }
      if (err.message === 'NotFound') {
        next(new NotFoundError({ message: 'Карточка по данному id не найдена' }));
        return;
      }
      next(err);
    });
};