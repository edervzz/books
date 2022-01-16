const { Router } = require('express');
const router = Router();
const auth = require('./middleware/auth');
const { sqlite } = require('./sources/'); 
const { insertBook } = require('./sources/sqlite');

// after authorization check the current user will be on req.user
// ============================================================================
// ** Create wishlist
router.post("/wishlist", auth, async (req, res) => {
  // check if wishlist is was created before
  // const wishlistFound = await mongodb.getWishlist(req.user, req.body.name);
  const wishlistFound = sqlite.selectAllWishlist(req.userId);
  if(wishlistFound){
    const wlDuplicated = wishlistFound.find((elem) => elem.Name === req.body.name);
    if(wlDuplicated){
      console.log(wlDuplicated);
      return res.sendStatus(304);
    }
      
  }

  // create a new wishlist
  // const wishlist = await mongodb.createWishlist(req.user, req.body.name);\
  const wishlist = sqlite.insertWishlist(req.userId, req.body.name);
  console.log(wishlist);
  if(wishlist){
    res.sendStatus(201);
  } else{
    const message = {
      message: "Cannot create a wishlist"
    }
    res.status(400).send(message);
  }  
});

// ============================================================================
// ** Add book to wishlist
router.post("/wishlist/:id/books", auth, async (req, res) => {
  // first try to find the book by name 
  // const wishlist = await mongodb.getWishlist(req.user, req.params.wlname);
  let wishlistAll = [] = sqlite.selectAllWishlist(req.userId);
  const wishlistFound = wishlistAll.find((elem) => {
    return elem.WishlistsId === parseInt(req.params.id);
  });

  if(!wishlistFound){
    const message = {
      message: "Wishlist not found"
    };
    return res.status(400).send(message);
  }

  const wishlist = sqlite.selectWishlistAndBooks(req.userId, wishlistFound.WishlistsId);
  const bookFound = wishlist.books.find((elem) => 
    elem.bookId === req.body.bookId 
  );
  // if book was found send not modified
  if(bookFound){
    return res.status(304).send(wishlist);
  }

  let authorsConcat = '';
  let counter = 0;
  for(const item of req.body.authors){
    counter++;
    if(counter === req.body.authors.length)
      authorsConcat = authorsConcat + item;
    else
      authorsConcat = authorsConcat + item + '|';
  }

  //  add book to wishlist
  const addedBook = insertBook(
    wishlistFound.WishlistsId,
    req.body.bookId,
    req.body.title,
    authorsConcat,
    req.body.publisher,
    req.body.language
  );
  
  // if ok then created book else send error 
  if(addedBook){
    res.sendStatus(201);
  } else {
    res.status(400).send();
  }
});

// ============================================================================
// ** Get All wishlist
router.get("/wishlist", auth, async (req, res) => {
  // retrieve all wishlists or send error not found
  // const wishlists = await mongodb.getAllWishlist(req.user);
  const wishlists = sqlite.selectAllWishlist(req.userId);
  if(wishlists){
    res.send(wishlists);
  } else {
    res.status(404).send();
  }  
});

// ============================================================================
// ** Get wishlist
router.get("/wishlist/:id", auth, async (req, res) => {
  // get a wishlist by name otherwise send error not  found
  // const wishlist = await mongodb.getWishlist(req.user, req.params.id);
  const wishlist = sqlite.selectWishlistAndBooks(req.userId, req.params.id);
  if(wishlist){
    res.send(wishlist);
  } else {
    res.status(404).send();
  }  
});

// ============================================================================
// ** Delete wishlist
router.delete("/wishlist/:id", auth, async (req, res) => {
  // try to delete wishlist by user if cannot delete then the wishlist doesnt exist or is already deleted
  // const wishlist = await mongodb.deleteWishlist(req.user, req.params.id);
  const wishlist = sqlite.deleteWishlist(req.userId, req.params.id);
  if(wishlist){
    res.sendStatus(200);
  } else{
    const message = {
      message: "Wishlist does not exist or is already deleted"
    }
    res.status(404).send(message);
  }  
});

// ============================================================================
// ** Remove book to wishlist
router.delete("/wishlist/:wlId/books/:bookId", auth, async (req, res) => {
  // first check if wishlist exist
  // const wlFound = await mongodb.getWishlist(req.user, req.params.wlname);
  const wlFound = sqlite.selectWishlistAndBooks(req.userId, req.params.id);
  let message;
  if(!wlFound){
    message = {
      message: `Wishlist not found.`
    }
    return res.status(404).send(message);
  }

  // try to delete book from wishlist
  // const wishlist = await mongodb.removeBookWishlist(
  const resultOk = sqlite.deleteBook(
    req.params.wlId,
    req.params.bookId
  );
  
  // if ok then well else send error
  if(resultOk){
    return res.sendStatus(200);
  } else {
    message = {
      message: "Cannot delete book or is already deleted"
    }
    return res.status(400).send(message);
  } 

});

module.exports = router;