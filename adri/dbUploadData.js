const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost/vidlydb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.log('Could not connect to MongoDB...', err));

var Schema = mongoose.Schema;

var genreSchema = new Schema({
  genre : {
    type      : String,
    required  : true,
    minlength : 4,
    maxlength : 50
  }
});

const Genre = mongoose.model('Genre', genreSchema);

async function createGenres() {
  const genres = [
    { id: 1, genre: 'Anime' },
    { id: 2, genre: 'Action' },
    { id: 3, genre: 'Adventure' },
    { id: 4, genre: 'Comedy' },
    { id: 5, genre: 'Crime' },
    { id: 6, genre: 'Drama' },
    { id: 7, genre: 'Fantasy' },
    { id: 8, genre: 'Historical' },
    { id: 9, genre: 'Historical fiction' },
    { id: 10, genre: 'Horror' },
    { id: 11, genre: 'Magical realism' },
    { id: 12, genre: 'Mystery' },
    { id: 13, genre: 'Paranoid Fiction' },
    { id: 14, genre: 'Philosophical' },
    { id: 15, genre: 'Political' },
    { id: 16, genre: 'Romance' },
    { id: 17, genre: 'Saga' },
    { id: 18, genre: 'Satire' },
    { id: 19, genre: 'Science fiction' },
    { id: 20, genre: 'Social' },
    { id: 21, genre: 'Speculative' },
    { id: 22, genre: 'Thriller' },
    { id: 23, genre: 'Urban' },
    { id: 24, genre: 'Western' }
  ];

  try {
    const result = await Genre.insertMany(genres);
    console.log('result', result);
  } catch (ex) {
    for (field in ex.errors) {
      console.log(ex.errors[field].message);
    }
  }
}

async function run() {
  createGenres();
}

run();
