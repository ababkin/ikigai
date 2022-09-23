const { Client } = require('pg/lib')
var AWS = require('aws-sdk')
AWS.config.update({region: "us-east-1"});
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
    
// this func queries all user's entries in the cart, aggregates them into a map, clears the entries in the cart,
// and returns the aggregate map 
async function clearCart(userId) {
  const queryParams = {
    TableName: "Cart",
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  };

  const queryResults = await ddb.query(queryParams).promise()

  // make a cart map
  const mp = queryResults.Items.reduce((acc, r) => {
    if(acc[r.BookId]){
      acc[r.BookId] += r.Diff
    } else {
      acc[r.BookId] = r.Diff
    } 
    return acc;
  },{});


  if (queryResults.Items && queryResults.Items.length > 0) {
    
    const batchCalls = chunks(queryResults.Items, 25).map( async (chunk) => {
      const deleteRequests = chunk.map( item => {
        return {
          DeleteRequest : {
            Key : {
              'UserId' : item.UserId,
              'Timestamp' : item.Timestamp,
            }
          }
        }
      })

      const batchWriteParams = {
        RequestItems : {
          ["Cart"] : deleteRequests
        }
      }
      await ddb.batchWrite(batchWriteParams).promise()
    })

    await Promise.all(batchCalls)
  }

  return mp;
}

function chunks(inputArray, perChunk) {
  return inputArray.reduce((all,one,i) => {
    const ch = Math.floor(i/perChunk); 
    all[ch] = [].concat((all[ch]||[]),one); 
    return all
 }, [])
}

// this func takes a map with bookId keys and diff values (how many of this book to subtract from inventory)
// and updates the inventory accordingly
async function updateInventory(mp) {
  const client = new Client({
    database: "bookstore",
    user: "postgres",
    password: "3YPhV!03H$49",
    host: "bookstore.ch70ne1ki76a.us-east-1.rds.amazonaws.com",
    port: 5432
  })
    
  try {
    await client.connect()

    for (const [bookId, diff] of Object.entries(mp)) {
      console.log(`${bookId}: ${diff}`);

      const query = `UPDATE "books" SET "quantity_available" = "quantity_available"-$1 WHERE "id" = $2`;

      await client.query(query, [diff, bookId]);

    }
  } catch (error) {
      console.error(error.stack);
      return false;
  } finally {
      await client.end();              // closes connection
  }

}

exports.handler = async(event, context, callback) => {

  console.log(JSON.stringify({ event, context }))

  const userId = parseInt(event.userId);
  console.log('userId: ' + userId);

  const cartMap = await clearCart(userId);   
  await updateInventory(cartMap);

}