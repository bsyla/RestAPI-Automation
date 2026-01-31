const { request } = require("express");
const Mocha = require("mocha");
const supertest = require("supertest");

class DiscordReporter extends Mocha.reporters.Spec {
  constructor(runner) {
    super(runner);

    const webhookURL = process.env.DISCORD_WEBHOOK_URL || "";
    if (!webhookURL) {
      console.warn("DISCORD_WEBHOOK_URL not set; skipping Discord report.");
      return;
    }
    const requestST = supertest(webhookURL);

    runner.on("end", async () => {
      const passes = runner.stats.passes;
      const failures = runner.stats.failures;
      const duration = runner.stats.duration;

      const message = `Mocha tests execution results:\nPassed: ${passes}\nFailed: ${failures}\nDuration: ${duration}ms`;
      try {
        await requestST.post("").send({ content: message });
        console.log("notification sent");
      } catch (error) {
        console.log("Failed to send discord message");
      }
    });
  }
}

module.exports = DiscordReporter;
