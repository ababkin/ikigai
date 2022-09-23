var AWS = require('aws-sdk')
AWS.config.update({region: "us-east-1"});
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });


async function clearCart(userId) {
  const queryParams = {
    TableName: "Cart",
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  };

  const queryResults = await ddb.query(queryParams).promise()
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
}

function chunks(inputArray, perChunk) {
  return inputArray.reduce((all,one,i) => {
    const ch = Math.floor(i/perChunk); 
    all[ch] = [].concat((all[ch]||[]),one); 
    return all
 }, [])
}

exports.handler = async(event, context, callback) => {

  console.log(JSON.stringify({ event, context }));

  const userId = parseInt(event.userId);
  console.log('userId: ' + userId);


  try {
    await clearCart(userId);
  }
  catch (err) {
    console.error(err);
  }

}