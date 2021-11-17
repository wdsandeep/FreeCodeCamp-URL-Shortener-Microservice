require('dotenv').config();
const ShortUrlModel = require('./config');
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const dns = require('dns');
const app = express();
app.use(express.json());
app.use(express.urlencoded());
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:id', async (req, res) => {
  const find_id = req.params.id;
  let find = await ShortUrlModel.findOne({ short_url: find_id });
  if (find) {
    res.redirect(find.original_url);
  } else {
    res.send({ error: "No short URL found for the given input" });
  }
});

app.post('/api/shorturl', async function (req, res) {
  const received_url = req.body.url
  // console.log(urlObject);
  // console.log(urlObject.hostname);
  // console.log(validUrl.isUri(received_url));

  if (!validUrl.isWebUri(received_url)) {
    res.json({ error: "Invalid URL" });
    res.end();
  } else {
    const urlObject = new URL(received_url);

    dns.lookup(urlObject.hostname, async (err) => {
      if (err) return res.json({ error: "Invalid Hostname" });
      else {

        let all = await ShortUrlModel.find();
        let find = await ShortUrlModel.findOne({ original_url: received_url });
        // console.log(all);
        // console.log(find);
        // if found return shortUrl
        if (find) {
          // console.log(find)
          res.send({ original_url: find.original_url, short_url: find.short_url });
          res.end();
        } else if (all.length) {
          // if url not found then get max shortUrl number and insert with +1
          // console.log(all)
          let max = await ShortUrlModel.findOne().select('short_url').sort({ short_url: -1 }).limit(1);
          // console.log(max);
          let data = new ShortUrlModel({ original_url: received_url, short_url: max.short_url + 1 });
          let result = await data.save();
          res.send(result);
          res.end();
        } else {
          // add data with shortUrl = 1
          let data = new ShortUrlModel({ original_url: received_url, short_url: 1 });
          let result = await data.save();
          res.send(result);
          res.end();
        }


      }
    });

  }


});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
