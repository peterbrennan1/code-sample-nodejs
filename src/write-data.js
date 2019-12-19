const AWS = require('aws-sdk');
var Validator = require('jsonschema').Validator;

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-west-2',
  // what could you do to improve performance?
});

const tableName = 'SchoolStudents';

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = async (event) => {
  //√ validate that all expected attributes are present (assume they are all required)

  var v = new Validator();
  var schema = {
    "id": "/Student",
    "type": "object",
    "properties": {
      "schoolId": { "type": "string" },
      "schoolName": { "type": "string" },
      "studentId": { "type": "string" },
      "studentFirstName": { "type": "string" },
      "studentLastName": { "type": "string" },
      "studentGrade": { "type": "string" }
    }
  }

  v.addSchema(schema, '/Student');
  let result = v.validate(event, schema);
  if(result.errors.length > 0) {
    let msg = { "message": "Encountered schema errors. Count=" + result.errors.length};
    return msg;
  }


  var params = {
    TableName : tableName,
    Item: event
  };
  
  return await dynamodb.put(params).promise();
};