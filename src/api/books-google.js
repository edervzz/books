const { Router } = require('express');
const router = Router();
const auth = require('./middleware/auth');
const axios = require('axios');

// ============================================================================
// Search Books from google books API
router.get("/books", auth, async (req, res) => {
  let data = {
    items: []
  };
  // prepare endpoint for searching
  let query = "q=";
  query = req.query.title ? query.concat(`${req.query.title}`) : query;
  query = req.query.author ? query.concat(`+inauthor:${req.query.author}`) : query;
  query = req.query.publisher ? query.concat(`+inpublisher:${req.query.publisher}`) : query;
  query = req.query.key ? query.concat(`&key=${req.query.key}`) : query;
  query = `https://www.googleapis.com/books/v1/volumes?${query}`;
  console.log(query);

  // execute axios
  const searchResult = await axios.get(query);
  const itemsResult = searchResult.data;

  // if well, prepare items in a short representation
  if(itemsResult.items) {
    itemsResult.items.forEach((elem) => {
      if(elem.volumeInfo.publisher){
        const volumeInfo = {
          bookId: elem.id,
          title: elem.volumeInfo.title,
          authors: elem.volumeInfo.authors,
          publisher: elem.volumeInfo.publisher,
          language: elem.volumeInfo.language
        };
        if(!data.items.find(e => e.title == elem.volumeInfo.title)){
          data.items.push(volumeInfo);
        }
      } 
    });
  }

  //send result / error not found
  if(data.items.length !== 0)
    res.send(data);
  else
    res.status(404).send();
});

module.exports = router;