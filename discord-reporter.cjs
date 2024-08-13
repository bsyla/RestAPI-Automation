const { request } = require("express");
const Mocha = require("mocha");
const supertest = require("supertest");

class DiscordReporter extends Mocha.reporters.Spec {
  // DiscordReporter class extends the Spec reporter from Mocha, which provides a specification-style test output.
  constructor(runner) {
    //constructor takes a runner argument, which is a Mocha Runner instance responsible for running tests and tracking stats
    super(runner); //super(runner) calls the parent class (Spec reporter) constructor.

    const webhookURL =
      "https://discord.com/api/webhooks/1245037326376112269/tUgHVcUDIVh2njIN1ZhtOm7S03cbHNYSXV7QN0No5t3TQg7-EBjKbjZYtG4R_xaP0aKh";
    const requestST = supertest(webhookURL);

    runner.on("end", async () => {
      //An event listener is set up to run when the tests finish (end event)
      const passes = runner.stats.passes;
      const failures = runner.stats.failures;
      const duration = runner.stats.duration;
      //Test statistics are extracted from the runner.stats object, including the number of passes, failures, and the total duration

      const message = `Mocha tests execution results:\nPassed: ${passes}\nFailed: ${failures}\nDuration: ${duration}ms`;
      try {
        await requestST.post("").send({ content: message });
        //POST request is sent to the Discord webhook URL using supertest, with the message as the payload
        console.log("notification sent");
      } catch (error) {
        console.log("Failed to send discord message");
      }
    });
  }
}

module.exports = DiscordReporter;
// DiscordReporter class is exported, allowing it to be used in other parts of the application or test suite
