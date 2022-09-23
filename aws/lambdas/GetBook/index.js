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

  const bookId = event.bookId;
  console.log('bookId: ' + bookId);

  let response
  try {
    console.log('Connecting to database')
    await client.connect()

    console.log('Quering the database')
    
    const { rows } = await client.query('SELECT * FROM books WHERE id = $1', [bookId])
    var book = rows[0];
    
    // fetch info about how many total reservations are there for this book
    await ddb
      .get({
        TableName: "ReservedBooks",
        Key: {
          BookId: book.id
        }
      })
      .promise()
      .then(result => {
        console.log('result:')
        console.log(result)
        const reserved = result.Item ? result.Item.Diff : null;
        
        if(reserved){
          book.quantity_available = parseInt(book.quantity_available) - reserved
        } else {
          book.quantity_available = parseInt(book.quantity_available)
        }
        return book
      })
      
    console.log('book after updated reserved quantity');
    console.log(book);

    //fetch the cart of the current user
    const params = {
      TableName: "Cart",
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    
    const result = await ddb
      .query(params)
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
    
        // augment the book info with quantities in the current user's cart
        book["incart"] = cart[book.id] ? cart[book.id] : 0;

        console.log(book);
        return book;

      });
        
    return result;

  } catch (error) {
    console.error(error)
    response = {
      statusCode: 500,
      body: error.message
    }
  } finally {
    console.log('Closing database connection')
    await client.end()
  }
}