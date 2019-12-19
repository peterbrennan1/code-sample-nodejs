const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-west-2',
  // what could you do to improve performance?
});

const tableName = 'SchoolStudents';
const studentLastNameGsiName = 'studentLastNameGsi';
var allData = [];
/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler =  async (event) => { 
  allData = [];
  // √ use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).

  
  // √ (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.

  // √ (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to return all
  //  pages of records found by the query (uncomment the test which exercises this functionality)

  var params = {
    TableName: tableName,
    KeyConditionExpression: 'schoolId = :hkey',
    ExpressionAttributeValues: {
      ':hkey':event.schoolId
    },
    Limit: 5
    
  };


  if(event.studentLastName) {
    params = {
      TableName: tableName,
      IndexName: studentLastNameGsiName,
      KeyConditionExpression: 'studentLastName = :rkey',
      ExpressionAttributeValues: {
        ':rkey': event.studentLastName
      },
      Limit: 5
    };
  }


  await getData(params);

  return allData;

};


const getData = async (params) => { 

  console.log("Querying Table");
  let data = await dynamodb.query(params).promise();

  if(data['Items'].length > 0) {
      allData = [...allData, ...data['Items']];
  }

  if (data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      return await getData(params);
  } else {
      return data;
  }
}