var AWS = require('aws-sdk')
AWS.config.update({region: "us-east-1"});
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

function extractDiffs(event){
  return event.Records.reduce((acc, rec) => {
    // look for INSERT and REMOVE events and handle them differently
    if(rec.eventName == "INSERT"){
      const data = rec.dynamodb.NewImage;
      const bookId = parseInt(data.BookId.N);
      const diff = parseInt(data.Diff.N);
      if(acc[bookId]){
        acc[bookId] += diff;
      } else {
        acc[bookId] = diff;
      }
      return acc;
    } else if(rec.eventName == "REMOVE"){
      const data = rec.dynamodb.OldImage;

      console.log("data: " + data);
      const bookId = parseInt(data.BookId.N);
      const diff = parseInt(data.Diff.N);
      if(acc[bookId]){
        acc[bookId] -= diff;
      } else {
        acc[bookId] = -diff;
      }
      return acc;
    } else {
      console.log("ignoring event: " + rec.eventName);
      return acc;
    }
  }, {})
}

function updateReservedBooks(diffs) {
  return Promise.all(Object.entries(diffs).map(entry => {
    const [bookId, diff] = entry;

    const params = {
        TableName: "ReservedBooks",
        Key: { "BookId": parseInt(bookId) },
        UpdateExpression: "ADD Diff :d",
        ExpressionAttributeValues: { ":d": diff }
    }
    return ddb.update(params).promise();
  }));

}

exports.handler = async(event, context, callback) => {

  console.log(JSON.stringify({ event, context }));

  const diffs = extractDiffs(event);
  console.log(diffs);

  try {
      await updateReservedBooks(diffs);

      return {
          statusCode: 201
      }
  }
  catch (err) {
      console.error(err);
  }

  // const userId = event.headers.userId;

  // console.log('diff: ' + diff);
    
  // const ts = new Date().toISOString();

  // var params = {
  //   TableName: 'Cart',
  //   Item: {
  //     'UserId' : userId,
  //     'Timestamp' : ts,
  //     'BookId' : bookId,
  //     'Diff' : diff
  //   }
  // };

  // await docClient.put(params).promise()
  // .then((data) => {
  //     console.info('successfully update to dynamodb', data)
  // })
  // .catch((err) => {
  //     console.info('failed adding data dynamodb', err)
  // });

}