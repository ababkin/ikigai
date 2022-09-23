const { Client } = require('pg/lib')
var AWS = require('aws-sdk')
AWS.config.update({region: "us-east-1"});
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
    
exports.handler = async(event, context, callback) => {

  console.log(JSON.stringify({ event, context }))

  const client = new Client({
    database: "bookstore",
    user: "postgres",
    password: "3YPhV!03H$49",
    //host: "myproxy.proxy-ch70ne1ki76a.us-east-1.rds.amazonaws.com",
    //port: 3306
    host: "bookstore.ch70ne1ki76a.us-east-1.rds.amazonaws.com",
    port: 5432

  })

  const userId = parseInt(event.userId);
  console.log('userId: ' + userId);

  let response

  try {
    await client.connect()
    
    // get all books from PG
    const { rows } = await client.query('SELECT * FROM books')
      
    
    // read ReservedBooks records for each book
    const result = await Promise.all(rows.map(row => {
      const bookId = row.id;

      return ddb
        .get({
          TableName: "ReservedBooks",
          Key: {
            BookId: bookId
          }
        })
        .promise();

    })).then(drs => {
      // turn reserves into an object for easy indexing
      const reserves = drs.filter(r => r.Item).reduce((acc, r) => {
        acc[r.Item.BookId] = r.Item.Diff; 
        return acc
      }, {}); 


      // update each book's available quantity with reserved quantity
      const books = rows.map(row => {
        const diff = reserves[row.id]
        // not sure why JS (or the pg lib) decides to turn values in numeric fields into strings :\ 
        if(diff){
          row.quantity_available = parseInt(row.quantity_available) - diff
        } else {
          row.quantity_available = parseInt(row.quantity_available)
        }
        return row
      })
      
      console.log(books);

      //fetch the cart of the current user
      const params = {
        TableName: "Cart",
        KeyConditionExpression: "UserId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        }
      };
      
      return ddb.query(params)
      .promise().then(cartItems => {
        // aggregate all cart records
        const cart = cartItems.Items.reduce((acc, r) => {
          if(acc[r.BookId]){
            acc[r.BookId] += r.Diff;
          } else {
            acc[r.BookId] = r.Diff;
          }
          return acc
        }, {}); 
      
        // augment the books info with quantities in the current user's cart
        const booksWithCart = books.map(book => {
          book["incart"] = cart[book.id] ? cart[book.id] : 0;
          return book;
        });
        
        console.log(booksWithCart);
        return booksWithCart;
      });

    });
    
    return result;
    
  } catch (error) {
    console.log('error: ' + error)
    console.error(error)
  } finally {
    console.log('Closing database connection')
    await client.end()
  }

}