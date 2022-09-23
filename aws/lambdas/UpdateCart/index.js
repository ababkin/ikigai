var AWS = require('aws-sdk')
AWS.config.update({region: "us-east-1"});
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event, context, callback) => {

  console.log(JSON.stringify({ event, context }));

  const userId = parseInt(event.userId);
  const bookId = parseInt(event.bookId);
  const diff = parseInt(event.diff);

  console.log('bookId: ' + bookId);
  console.log('userId: ' + userId);
  console.log('diff: ' + diff);
    
  const ts = new Date().toISOString();

  var params = {
    TableName: 'Cart',
    Item: {
      'UserId' : userId,
      'Timestamp' : ts,
      'BookId' : bookId,
      'Diff' : diff
    }
  };

  await docClient.put(params).promise()
  .then((data) => {
      console.info('successfully update to dynamodb', data)
  })
  .catch((err) => {
      console.info('failed adding data dynamodb', err)
  });

}