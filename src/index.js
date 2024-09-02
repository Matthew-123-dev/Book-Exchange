const { hexToString, stringToHex } = require("viem");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

let books = {};
let exchanges = {};

function listBook(userId, title, author, condition, availability) {
  const bookId = Date.now().toString();
  const newBook = {
    id: bookId,
    userId,
    title,
    author,
    condition,
    availability,
    listedAt: new Date().toISOString()
  };
  
  if (!books[userId]) {
    books[userId] = [];
  }
  books[userId].push(newBook);

  return {
    message: "Book listed successfully",
    bookId: bookId
  };
}

function searchBooks(query) {
  const allBooks = Object.values(books).flat();
  return allBooks.filter(book => 
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase())
  );
}

function requestExchange(requesterId, bookId) {
  const bookOwner = Object.keys(books).find(userId => 
    books[userId].some(book => book.id === bookId)
  );

  if (!bookOwner) {
    throw new Error("Book not found");
  }

  const exchangeId = Date.now().toString();
  const newExchange = {
    id: exchangeId,
    requesterId,
    bookOwnerId: bookOwner,
    bookId,
    status: "pending",
    requestedAt: new Date().toISOString()
  };

  exchanges[exchangeId] = newExchange;

  return {
    message: "Exchange requested successfully",
    exchangeId: exchangeId
  };
}

function respondToExchange(userId, exchangeId, accept) {
  if (!exchanges[exchangeId]) {
    throw new Error("Exchange request not found");
  }

  if (exchanges[exchangeId].bookOwnerId !== userId) {
    throw new Error("Unauthorized to respond to this exchange");
  }

  exchanges[exchangeId].status = accept ? "accepted" : "rejected";
  exchanges[exchangeId].respondedAt = new Date().toISOString();

  return {
    message: `Exchange ${accept ? "accepted" : "rejected"} successfully`,
    exchangeId: exchangeId
  };
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payloadString = hexToString(data.payload);
  console.log(`Converted payload: ${payloadString}`);

  try {
    const payload = JSON.parse(payloadString);
    let result;

    switch (payload.action) {
      case "listBook":
        result = listBook(payload.userId, payload.title, payload.author, payload.condition, payload.availability);
        break;
      case "searchBooks":
        result = searchBooks(payload.query);
        break;
      case "requestExchange":
        result = requestExchange(payload.requesterId, payload.bookId);
        break;
      case "respondToExchange":
        result = respondToExchange(payload.userId, payload.exchangeId, payload.accept);
        break;
      default:
        throw new Error("Invalid action");
    }

    const outputStr = stringToHex(JSON.stringify(result));

    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: outputStr }),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorStr = stringToHex(JSON.stringify({ error: error.message }));
    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: errorStr }),
    });
  }
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hexToString(payload);

  let responseObject;
  switch (route) {
    case "books":
      responseObject = JSON.stringify(books);
      break;
    case "exchanges":
      responseObject = JSON.stringify(exchanges);
      break;
    case "totalBooks":
      responseObject = JSON.stringify({ totalBooks });
      break;
    case "totalExchanges":
      responseObject = JSON.stringify({ totalExchanges });
      break;
    default:
      responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: stringToHex(responseObject) }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
