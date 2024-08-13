# REST API Automation

This project goes over automation testing for different endpoints of the app [todoist](https://todoist.com/)

- Scenarios evaluated are:
  - Creating a project
  - Updating Created Projected
  - Creating/Updating project with incorrect credentials

* Validation is made based on response data type, code, values etc.

## Tech Stack

**Libraries:** chai, mocha, supertest, get-nested-value, mochawesome, faker.js

**Requirements:** Node (min version 14)

## Installation

Install with npm

```bash
  npm install
```

## Setting up authentication

Create a file in the root directory named `config.js` and insert:

```bash
  export const config ={
    PROD: {
      host:"https://api.todoist.com/rest/v2",
      apiKey:"your-API-Key"
      },
  }

  global.executionVariables = {};
```

## Running Tests

To run tests, run the following command

```bash
  npm run projects-mochawesome ##Reporter will be mochawesome
  npm run projects-discord ##Report will be delivered via Discord
```

#### Execution report can be found at /mochawesome-report/mochawesome.html

#### Execution report for discord can be sent to your own bot but you need to change the webHookURL value at discord-reporter.cjs

## Structure of each section:

## Authentication:

**Authentication was done as suggested using a personal API Token which i stored in the config.js file**

## Crud:

**Faker.js library was used for random name generation**

**Stored the supported colors in an array and with a random function selected one of them when creating project**

**Stored Negative Scenarios in before hook in order to mantain a clean file hierarchy and not have multiple tests among multiple files**

**Validation done for negative scenarios was based on the response's status code and assertion the object was undefined**

**getProject request is called after creation and update of a project to validate that the data changed is stored in global.env**

**In Positive Scenarios i have validated the values and types the response contained**

## Reporting:

**As requested i have used a simple reporting mechanism to log the results(mochawesome) and implemented a Discord Reporter with basic information on the test run**
