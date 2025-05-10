const fs = require("fs");
const path = require("path");
const openai = require("openai");
const sqlite3 = require("sqlite3").verbose();
const { performance } = require("perf_hooks");

console.log("Starting database actions...");

const fdir = __dirname;

function get_db_path(fname) {
  return path.join(fdir, fname);
}

const sqliteDBPath = get_db_path("aidb.sqlite");
const setupSqlPath = get_db_path("setup.sql");
const setupSqlDataPath = get_db_path("setupData.sql");

if (fs.existsSync(sqliteDBPath)) {
  fs.unlinkSync(sqliteDBPath);
}

const db = new sqlite3.Database(sqliteDBPath, (err) => {
  if (err) {
    console.error(
      "Error opening database " + sqliteDBPath + ": " + err.message
    );
    return;
  }

  const setupSqlScript = fs.readFileSync(setupSqlPath, "utf8");
  const setupSqlDataScript = fs.readFileSync(setupSqlDataPath, "utf8");

  db.exec(setupSqlScript, (err) => {
    if (err) {
      console.error("Error executing setup SQL:", err.message);
      return;
    }

    db.exec(setupSqlDataScript, (err) => {
      if (err) {
        console.error("Error executing setup data SQL:", err.message);
        return;
      }
      console.log("Database setup complete.");

      // Move the strategies definition here
      const commonSqlOnlyRequest =
        "Give me a sqlite select statement that answers the question. Only respond with sqlite syntax. If there is an error do not explain it!";
      const strategies = {
        zero_shot: setupSqlScript + commonSqlOnlyRequest,
        single_domain_double_shot:
          setupSqlScript +
          " What are the names of all the male users on this dating app? " +
          " \nSELECT firstname, lastname\nFROM person p\nWHERE gender = 'm';\n " +
          commonSqlOnlyRequest,
      };

      // Proceed with queries after database setup
      processQueries(strategies);
    });
  });
});

let configPath = get_db_path("config.json");
console.log("Config path: " + configPath);
let config;

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

const openAIClient = new openai.OpenAI({
  apiKey: config.apiKey,
});

async function getChatGptResponse(content) {
  const stream = await openAIClient.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: content }],
    stream: true,
  });

  let responseList = [];
  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content !== undefined) {
      responseList.push(chunk.choices[0].delta.content);
    }
  }
  const result = responseList.join("");
  return result;
}

function runSql(query) {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Questions
const questions = [
  "Which users matched using this dating app?",
  "Which users are in similar locations?",
  "Do any of the users have multiple matches?",
  "What are the different locations where the users live?",
  "How many people are using the dating app?",
  "Who has a contact method of email?",
  "Who is the most attractive person on this dating app?",
  "What should a user do to get more matches?",
];

function sanitizeForJustSql(value) {
  const gptStartSqlMarker = "```sql";
  const gptEndSqlMarker = "```";
  if (value.includes(gptStartSqlMarker)) {
    value = value.split(gptStartSqlMarker)[1];
  }
  if (value.includes(gptEndSqlMarker)) {
    value = value.split(gptEndSqlMarker)[0];
  }
  return value;
}

async function processQueries(strategies) {
  for (const strategy in strategies) {
    let responses = { strategy: strategy, prompt_prefix: strategies[strategy] };
    let questionResults = [];
    for (const question of questions) {
      console.log("Question: " + question);
      let error = "None";
      let queryRawResponse = "";
      let friendlyResponse = "";
      let sqlSyntaxResponse = "";

      try {
        const getSqlFromQuestionEngineeredPrompt =
          strategies[strategy] + " " + question;

        sqlSyntaxResponse = await getChatGptResponse(
          getSqlFromQuestionEngineeredPrompt
        );
        sqlSyntaxResponse = sanitizeForJustSql(sqlSyntaxResponse);
        console.log("SQL Syntax Response: " + sqlSyntaxResponse);

        const rows = await runSql(sqlSyntaxResponse);
        queryRawResponse = JSON.stringify(rows);
        console.log(queryRawResponse);

        const friendlyResultsPrompt = `I previously asked the question: "${question}", and the sql query response you gave me was: "${queryRawResponse}". Would you be able to give me a concise, natural language response in a more friendly way?`;
        friendlyResponse = await getChatGptResponse(friendlyResultsPrompt);
        console.log(friendlyResponse);
      } catch (err) {
        error = err.message;
        console.error(err);
      }

      questionResults.push({
        question,
        sql: sqlSyntaxResponse,
        queryRawResponse,
        friendlyResponse,
        error,
      });
    }
    responses["questionResults"] = questionResults;
    const timestamp = performance.now();
    const outputPath = get_db_path(`response_${strategy}_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(responses, null, 2));
  }
  console.log("All queries processed.");
}
