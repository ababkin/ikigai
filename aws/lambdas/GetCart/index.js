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
      
    
    //fetch the cart of the current user
    const params = {
      TableName: "Cart",
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    
    const result = await ddb.query(params)
    .promise().then(cartItems => {
      // aggregate all cart records
      const cartMap = cartItems.Items.reduce((acc, r) => {
        if(acc[r.BookId]){
          acc[r.BookId] += r.Diff;
        } else {
          acc[r.BookId] = r.Diff;
        }
        return acc
      }, {}); 
    
      // augment the books info with quantities in the current user's cart
      const cart = rows.map(book => {
        book["incart"] = cartMap[book.id] ? cartMap[book.id] : 0;
        delete book.quantity_available; // not needed here
        return book;
      }).filter(book => book["incart"] > 0);
      
      console.log(cart);
      return cart;
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