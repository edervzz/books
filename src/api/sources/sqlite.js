const Database = require('better-sqlite3');
const dbName = "./db/books.db";

const db = new Database(dbName);
console.log(`sqlite-db ${db.name}, open: ${db.open}`);

// ** prepare tables
function prepareTables(){
  if (db.open){
    const sql_create_table_users = `CREATE TABLE IF NOT EXISTS Users (UserId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Username TEXT NOT NULL,HashedPassword TEXT NOT NULL,CONSTRAINT users_UN UNIQUE (Username));`;
    const sql_create_table_wishlist = `CREATE TABLE IF NOT EXISTS Wishlists (WishlistsId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,UserId INTEGER NOT NULL,Name TEXT NOT NULL,CONSTRAINT wishlists_FK FOREIGN KEY (UserId) REFERENCES Users(UserId));`;
    const sql_create_table_books = `CREATE TABLE IF NOT EXISTS Books (BookId TEXT NOT NULL,Title TEXT NOT NULL,Authors TEXT NOT NULL,Publisher TEXT NOT NULL,Lang TEXT,CONSTRAINT Books_PK PRIMARY KEY (BookId));`;
    const sql_create_table_wishlist_books = `CREATE TABLE IF NOT EXISTS Wishlist_Books (WishlistsId INTEGER NOT NULL,BookId TEXT NOT NULL,CONSTRAINT Wishlist_Books_PK PRIMARY KEY (WishlistsId,BookId),CONSTRAINT Wishlist_Books_Wishlist_FK FOREIGN KEY (WishlistsId) REFERENCES Wishlists(WishlistsId),CONSTRAINT Wishlist_Books_Books_FK_1 FOREIGN KEY (BookId) REFERENCES Books(BookId));`;
    
    db.exec(sql_create_table_users);
    db.exec(sql_create_table_wishlist);
    db.exec(sql_create_table_books);
    db.exec(sql_create_table_wishlist_books); 
  }
}

// ** create User
function insertUser(username, hashedPassword){
  try {
    const stmt = db.prepare(`INSERT INTO 
      Users (Username, HashedPassword) 
      VALUES (?, ?)`);
    const info = stmt.run(`${username}`,`${hashedPassword}`);
    console.log(info);
    return info.lastInsertRowid;
  } catch (error) {
    console.log(error);
  }
}

// ** select User
function selectUser(UserId){
  try {
    const stmt = db.prepare(`SELECT * 
      FROM Users 
      WHERE UserId = ?`);
    const user = stmt.get(`${UserId}`);
    console.log(user);
    return user;
  } catch (error) {
    console.log(error);
  }
}

// ** select User by name
function selectUserByName(username){
  try {
    const stmt = db.prepare(`SELECT * 
      FROM Users 
      WHERE Username = ?`);
    const user = stmt.get(`${username}`);
    console.log(user);
    return user;
  } catch (error) {
    console.log(error);
  }
}

// ** insert nre wishlist
function insertWishlist(userId, name){
  try {
    const stmt = db.prepare(`INSERT INTO 
      Wishlists (UserId, Name) 
      VALUES (?, ?)`);
    const info = stmt.run(`${userId}`,`${name}`);
    console.log(info);
    return info.lastInsertRowid;
  } catch (error) {
    console.log(error);
  }
}

// select all wishlist by user
function selectAllWishlist(userId){
  try {
    const stmt = db.prepare(`SELECT * 
      FROM Wishlists 
      WHERE UserId = ?`);
    const wishlists = stmt.all(`${userId}`);
    return wishlists;
  } catch (error) {
    console.log(error);
  }6
}

// select a wishlist with its books
function selectWishlistAndBooks(userId, wishlistId){
  try {
    const stmt = db.prepare(`SELECT u.Username, w.Name, b.* 
      from Books b 
      inner join Wishlist_Books wb ON wb.BookId = b.BookId 
      inner join Wishlists w on w.WishlistsId  = wb.WishlistsId
      inner join Users u on u.UserId = w.UserId 
      where w.UserId = ? and w.WishlistsId = ?`);
    const stmtResult = stmt.all(`${userId}`,`${wishlistId}`);
    
    if(stmtResult === []) return;

    const result = {
      user: "",
      name: "",
      books: []
    }

    stmtResult.forEach((item) => {
      result.user = item.Username;
      result.name = item.Name;
      const book = {
        bookId: item.BookId,
        title: item.Title,
        authors: item.Authors.split("|"),
        publisher: item.Publisher,
        language: item.Lang
      }
      result.books.push(book);
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }    
}

// delete a wishlist 
function deleteWishlist(userId, wishlistId){
  let resultOk = false;
  try {

    const { books } = selectWishlistAndBooks(userId, wishlistId);

    const txBooks = db.transaction(() => {
      for (const b of books) {
        const deleteBook = db.prepare(`DELETE FROM Books WHERE BookId=?`);
        const info = deleteBook.run(b.bookId);
        console.log("deletedBook:",info);
      }
    });

    const txWishlist = db.transaction(() => {
      const deleteWishlist = db.prepare(`DELETE FROM Wishlists WHERE WishlistsId=?`);
      const info = deleteWishlist.run(wishlistId);
      console.log("deletedWishlist:",info);
    });

    const txWishlistBooks = db.transaction(() => {
      const deleteWishlist_Books = db.prepare(`DELETE FROM Wishlist_Books WHERE WishlistsId=? AND BookId=?`);
      for (const b of books) {
        const info = deleteWishlist_Books.run(wishlistId, b.bookId);
        console.log("deletedWishlistBooks:",info);
      }      
      txBooks();
      txWishlist();
      resultOk = true;
    });
    
    txWishlistBooks();

    return resultOk;
  } catch (error) {
    console.log(error);
  }
}

// insert a new book
function insertBook(wishlistId, bookId, title, authors, publisher, lang){
  let resultOk = false;
  let txBook = {};
  try {      
    const insertWishlist_Books = db.prepare(`INSERT INTO 
      Wishlist_Books (WishlistsId, BookId) 
      VALUES (?, ?)`);
    const txWishlist_Books = db.transaction(() => {
      const info = insertWishlist_Books.run(wishlistId, bookId);
      console.log("insertWishlist_Books:",info);
    });
    
    const insertBook = db.prepare(`INSERT INTO 
      Books (BookId, Title, Authors, Publisher, Lang) 
      VALUES (?, ?, ?, ?, ?)`);      
      txBook = db.transaction(() => {
      const info = insertBook.run(bookId, title, authors, publisher, lang);
      console.log("insertBook:",info);      
      txWishlist_Books();
      resultOk = true;
    });

    txBook();
    
    return resultOk;
  } catch (error) {
    console.log(error);
  }
}

// delete a book
function deleteBook(wishlistId, bookId){
  let resultOk = false;
  try {      
    const txBooks = db.transaction(() => {
      const deleteBook = db.prepare(`DELETE FROM Books WHERE BookId=?`);
      const info = deleteBook.run(bookId);
      console.log("deletedBook: ",info);
    });

    const txWishlistBooks = db.transaction(() => {
      const deleteWishlist_Books = db.prepare(`DELETE FROM Wishlist_Books WHERE WishlistsId=? AND BookId=?`);
      const info = deleteWishlist_Books.run(wishlistId, bookId);
      txBooks();
      resultOk = true;
      console.log("deletedWishlist_Books: ",info);        
    });

    txWishlistBooks();

    return resultOk;
    
  } catch (error) {
    console.log(error);
  }
}

module.exports.prepareTables = prepareTables;
module.exports.insertUser = insertUser;
module.exports.selectUser = selectUser;
module.exports.insertWishlist = insertWishlist
module.exports.selectAllWishlist = selectAllWishlist;
module.exports.insertBook = insertBook;
module.exports.selectWishlistAndBooks = selectWishlistAndBooks;
module.exports.deleteBook = deleteBook;
module.exports.deleteWishlist = deleteWishlist;
module.exports.selectUserByName = selectUserByName;