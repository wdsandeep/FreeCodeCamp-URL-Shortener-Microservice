require('dotenv').config();
const mongoose = require('mongoose');
const url = 'mongodb+srv://' + process.env.USER +':' + process.env.PASS +'@cluster0.vgg3n.mongodb.net/freecodecamp';
mongoose.connect(url);

const ShortUrlSchema = mongoose.Schema({
    original_url: String,
    short_url: Number
});

module.exports = mongoose.model('urlshortners', ShortUrlSchema);
