const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  endpoint: new AWS.Endpoint("http://localhost:8000"),
  region: "us-west-2",
  // what could you do to improve performance?
});

const tableName = "SchoolStudents";
const studentLastNameGsiName = "studentLastNameGsi";

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = (event) => {
  const { schoolId, studentId, studentLastName } = event;
  const params = {
    TableName: tableName,
    Limit: 5,
  };
  // TODO use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
  const getResults = async (params, output = []) => {
    const { LastEvaluatedKey, Items } = await dynamodb.query(params).promise();

    if (Items) {
      output.push(...Items);
    }

    if (!LastEvaluatedKey) {
      return output;
    }

    return getResults(
      { ...params, ExclusiveStartKey: LastEvaluatedKey },
      output
    );
  };
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  // TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.
  if (studentLastName) {
    params.IndexName = studentLastNameGsiName;
    params.KeyConditionExpression = "studentLastName = :studentLastName";
    params.ExpressionAttributeValues = {
      ":studentLastName": studentLastName,
    };

    return getResults(params);
  }

  params.KeyConditionExpression = [
    ...(schoolId ? ["schoolId = :schoolId"] : []),
    ...(studentId ? ["studentId = :studentId"] : []),
  ].join(" and ");

  params.ExpressionAttributeValues = {
    ...(schoolId && { ":schoolId": schoolId }),
    ...(studentId && { ":studentId": studentId }),
  };

  return getResults(params);
};
