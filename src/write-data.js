const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  // what could you do to improve performance?
});

const tableName = "SchoolStudents";
function validation(inputObjs, requiredProps) {
  let missingProps = [];

  for (prop of requiredProps) {
    if (!inputObjs.hasOwnProperty(prop)) {
      missingProps.push(prop);
    }
  }
  if (missingProps.length > 0) {
    throw new Error("Missing required attributes");
  }
}
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
exports.handler = (event) => {
  // TODO validate that all expected attributes are present (assume they are all required)

  const validFields = [
    "schoolId",
    "schoolName",
    "studentId",
    "studentFirstName",
    "studentLastName",
    "studentGrade",
  ];

  try {
    validation(event, validFields);
  } catch (err) {
    throw err;
  }

  return dynamodb.put({ TableName: tableName, Item: event }).promise();
};
