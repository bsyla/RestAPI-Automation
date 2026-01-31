import addContext from "mochawesome/addContext.js";
import supertest from "supertest";
import { config } from "../../config.js";
import { expect, assert } from "chai";
import getNestedValue from "get-nested-value";

export async function request(
  context,
  method,
  path,
  body = undefined,
  auth = true,
  asserts = { statusCode: 200 },
  host = undefined,
  customHeaders = undefined
) {
  // Build full URL so path is not resolved against base (e.g. /projects would replace /rest/v2 and 404).
  const base = (host || config.PROD.host).trim().replace(/\/$/, "");
  const pathPart = path.startsWith("/") ? path.slice(1) : path;
  const fullUrl = `${base}/${pathPart}`;
  const requestST = supertest(fullUrl);

  const headers = customHeaders
    ? customHeaders
    : {
        "Content-Type": "application/json",
        Accept: "*/*",
        Connection: "keep-alive",
        ...(auth && {
          Authorization: `Bearer ${config.PROD.apiKey}`,
        }),
      };

  let response = null;
  let responseBody;

  // URL is already full; use empty path so we hit fullUrl exactly.
  const emptyPath = "";

  switch (method) {
    case "GET":
      response = await requestST.get(emptyPath).set(headers);
      responseBody = response.body;

      await performValidation(
        responseBody,
        asserts,
        context,
        method,
        path,
        headers,
        response,
        body
      );

      break;
    case "POST":
      response = await requestST.post(emptyPath).send(body).set(headers);
      responseBody = response.body;

      await performValidation(
        responseBody,
        asserts,
        context,
        method,
        path,
        headers,
        response,
        body
      );

      break;
    case "PATCH":
      response = await requestST.patch(emptyPath).send(body).set(headers);
      responseBody = response.body;

      await performValidation(
        responseBody,
        asserts,
        context,
        method,
        path,
        headers,
        response,
        body
      );

      break;
    case "DELETE":
      response = await requestST.delete(emptyPath).send(body).set(headers);
      responseBody = response.body;

      await performValidation(
        responseBody,
        asserts,
        context,
        method,
        path,
        headers,
        response,
        body
      );
      break;
    default:
      console.log("not valid request method provided");
  }

  addRequestInfoToReport(context, method, path, headers, response, body);

  return response;
}

async function validateStatusCode(
  actual,
  expected,
  context,
  method,
  path,
  headers,
  response,
  requestBody
) {
  try {
    expect(actual).to.be.equal(expected);
  } catch (error) {
    addRequestInfoToReport(
      context,
      method,
      path,
      headers,
      response,
      requestBody
    );
    const hint =
      actual === 401
        ? " Todoist returned 401 Unauthorized — check that TODOIST_API_KEY in .env is valid (https://app.todoist.com/app/settings/integrations)."
        : "";
    assert.fail(
      error.actual,
      error.expected,
      `Actual is ${error.actual}, but expected was ${error.expected}.${hint}`
    );
  }
}

async function validateFieldsExists(
  body,
  fields,
  context,
  method,
  path,
  headers,
  response,
  requestBody
) {
  fields.every((field) => {
    try {
      expect(getNestedValue(field, body), `${field} present in body`).not.to.be
        .undefined;
    } catch (error) {
      addRequestInfoToReport(
        context,
        method,
        path,
        headers,
        response,
        requestBody
      );
      assert.fail(
        error.actual,
        error.expected,
        `${field} field is not present in body`
      );
    }
  });
}

async function validateFieldsDontExists(
  body,
  fields,
  context,
  method,
  path,
  headers,
  response,
  requestBody
) {
  if (!Array.isArray(fields) || fields.length === 0) return;
  fields.forEach((fieldPath) => {
    try {
      expect(getNestedValue(fieldPath, body), `${fieldPath} should be absent in body`).to.be.undefined;
    } catch (error) {
      addRequestInfoToReport(
        context,
        method,
        path,
        headers,
        response,
        requestBody
      );
      const actual = getNestedValue(fieldPath, body);
      assert.fail(
        actual,
        undefined,
        `${fieldPath} should not be present in body but was ${JSON.stringify(actual)}`
      );
    }
  });
}

//[{path: 'user', type: 'string'}, {path: '_id', type: 'string'}, {path: 'amount', type: 'number'}]
async function validateExpectedTypes(
  body,
  fields,
  context,
  method,
  path,
  headers,
  response,
  requestBody
) {
  fields.every((field) => {
    //{path: 'user', type: 'string'} -> field
    //suported data types number,string, boolean
    try {
      switch (field.type.toLowerCase()) {
        case "number":
          expect(getNestedValue(field.path, body)).to.be.a("number");
          break;
        case "string":
          expect(getNestedValue(field.path, body)).to.be.a("string");
          break;
        case "boolean":
          expect(getNestedValue(field.path, body)).to.be.a("boolean");
          break;
        default:
          console.log("not valid data type provided for assertion");
      }
    } catch (error) {
      addRequestInfoToReport(
        context,
        method,
        path,
        headers,
        response,
        requestBody
      );
      const actualValue = getNestedValue(field.path, body);
      const typeOfReceived = typeof actualValue;
      console.log(field);
      assert.fail(
        actualValue,
        field.type,
        `Expected type was ${field.type}, but received ${typeOfReceived} for value ${actualValue}`
      );
    }
  });
}

async function validateExpectedValues(
  body,
  fields,
  context,
  method,
  path,
  headers,
  response,
  requestBody
) {
  fields.forEach((field) => {
    try {
      expect(
        getNestedValue(field.path, body),
        `${field.path} not equal to ${field.value}`
      ).to.be.equal(field.value);
    } catch (error) {
      addRequestInfoToReport(
        context,
        method,
        path,
        headers,
        response,
        requestBody
      );
      const actual = getNestedValue(field.path, body);
      assert.fail(
        actual,
        field.value,
        `${field.path} expected value is ${field.value}, but actual was ${actual}`
      );
    }
  });
}

async function setExecutionVariables(body, variables) {
  variables.forEach((variable) => {
    global.executionVariables[variable.name] = getNestedValue(
      variable.path,
      body
    );
  });
}

async function validateExpectedValuesInArrayOfObjects(
  body,
  fields,
  context,
  method,
  path,
  headers,
  response,
  requestBody,
  idKey = "id",
  value
) {
  const objectToValidate = body
    .slice(1, body.length)
    .find((item) => item[idKey] === value);
  //It slices the report body to skip the first object(due to it being the default inbox one)and start reviewing from the second

  if (!objectToValidate) {
    assert.fail(
      idKey,
      value,
      `object with key ${idKey} and value ${value} not found`
    );
  } //If the object is not found, it throws an assertion failure.

  fields.forEach((field) => {
    try {
      expect(
        getNestedValue(field.path, objectToValidate),
        `${field.path} not equal to ${field.value}`
      ).to.be.equal(field.value);
      //For each field in the fields array, it uses the getNestedValue function to retrieve the value at the specified path within the objectToValidate.
      //It checks if the retrieved value equals the expected value using the expect assertion.
    } catch (error) {
      addRequestInfoToReport(
        context,
        method,
        path,
        headers,
        response,
        requestBody
      );
      const actual = getNestedValue(field.path, objectToValidate);
      assert.fail(
        actual,
        field.value,
        `${field.path} expected value is ${field.value}, but actual was ${actual}`
      );
      //If the assertion fails, it adds request information to the report and throws an assertion failure with detailed information about the discrepancy.
    }
  });
}

async function performValidation(
  responseBody,
  asserts,
  context,
  method,
  path,
  headers,
  response,
  body
) {
  await validateStatusCode(
    response.statusCode,
    asserts.statusCode,
    context,
    method,
    path,
    headers,
    response,
    body
  );

  if (asserts.expectedFields) {
    await validateFieldsExists(
      responseBody,
      asserts.expectedFields,
      context,
      method,
      path,
      headers,
      response,
      body
    );
  }

  if (asserts.notExpectedFields) {
    await validateFieldsDontExists(
      responseBody,
      asserts.notExpectedFields,
      context,
      method,
      path,
      headers,
      response,
      body
    );
  }

  if (asserts.expectedValues) {
    await validateExpectedValues(
      responseBody,
      asserts.expectedValues,
      context,
      method,
      path,
      headers,
      response,
      body
    );
  }

  if (asserts.executionVariables) {
    await setExecutionVariables(responseBody, asserts.executionVariables);
  }

  if (asserts.expectedTypes) {
    await validateExpectedTypes(
      responseBody,
      asserts.expectedTypes,
      context,
      method,
      path,
      headers,
      response
    );
  }

  if (asserts.expectedValuesInArrayOfObjects) {
    await validateExpectedValuesInArrayOfObjects(
      responseBody,
      asserts.expectedValuesInArrayOfObjects.fields,
      context,
      method,
      path,
      headers,
      response,
      body,
      asserts.expectedValuesInArrayOfObjects.idKey,
      asserts.expectedValuesInArrayOfObjects.value
    );
  }
}

function addRequestInfoToReport(
  context,
  method,
  path,
  headers,
  response,
  body
) {
  addContext(context, `${method} ${path}`);
  addContext(context, {
    title: "REQUEST HEADERS",
    value: headers,
  });
  if (body) {
    addContext(context, {
      title: "REQUEST BODY",
      value: body,
    });
  }
  addContext(context, {
    title: "RESPONSE HEADERS",
    value: response.headers,
  });
  addContext(context, {
    title: "RESPONSE BODY",
    value: response.body,
  });
}
