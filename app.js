const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const key = "AIzaSyBW-sTYuFO2r0N0LmMAcxqXKSYY9K0KYYQ";
const cx = "97f5dcf95601b403d";

const customSearch = async (query) => {
  try {
    let response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${query}`
    );

    const data = await response.json();
    const top_results = data.items.slice(0, 3);
    const result = top_results.map((item) => {
      return {
        title: item.title,
        link: item.link,
      };
    });
    return {
      status: 1,
      response: result,
    };
  } catch (error) {
    return {
      status: 0,
      response: "Error while performing search",
    };
  }
};

app.get("/", (req, res) => {
  res.status(200).send("Hello there");
});

app.post("/dialogflow", async (req, res) => {
  let action = req.body.queryResult.action;
  let queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {
    console.log(JSON.stringify(req.body));
    let result = await customSearch(queryText);
    // console.log(result);
    if (result.status == 1) {
      const payload = {
        fulfillmentMessages: [
          {
            card: {
              title: `Hasil untuk ${queryText}`,
              subtitle: "Yuk cek tautan berikut!",
              buttons: [
                {
                  text: result.response[0].title,
                  postback: result.response[0].link,
                },
                {
                  text: result.response[1].title,
                  postback: result.response[1].link,
                },
                {
                  text: result.response[2].title,
                  postback: result.response[2].link,
                },
              ],
            },
          },
        ],
      };

      // res.setHeader("Content-Type", "text/html");
      res.send(payload);
    } else {
      res.send({
        result: result,
        fulfillmentText: `Sorry, I'm not able to help with that.`,
      });
    }
  } else {
    res.send({
      fulfillmentText: `No handler for the action ${action}.`,
    });
  }
});

app.listen(PORT, "0.0.0.0");
console.log(`Listening on port ${PORT}`);
