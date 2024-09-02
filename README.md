# Book Exchange dApp

This decentralized application (dApp) implements a book exchange platform using Cartesi Rollups technology. Users can list books, request exchanges, and respond to exchange requests.

## Features

- List books for exchange
- Request book exchanges
- Respond to exchange requests
- View all books and exchanges
- Track total number of books and exchanges

## Prerequisites

- Node.js (v14 or later recommended)
- Cartesi Rollups environment

## Installation

1. Clone this repository:

2. Install dependencies:
   ```
   npm install
   ```

## Running the dApp

Start the dApp using the Cartesi Rollups environment. Refer to the Cartesi documentation for detailed instructions on how to run a Rollups dApp.

## Interacting with the dApp

### Sending Inputs (Advance Requests)

Use the Cartesi Rollups CLI or SDK to send inputs to the dApp:

1. List a book:

   ```
   {"action": "listBook", "userId": "user1", "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "condition": "Good", "availability": "Available"}
   ```

2. Request an exchange:

   ```
   {"action": "requestExchange", "requesterId": "user2", "bookId": "1234567890"}
   ```

3. Respond to an exchange request:
   ```
   {"action": "respondToExchange", "userId": "user1", "exchangeId": "9876543210", "accept": true}
   ```

### Making Inspect Calls

- Get all books: `"books"`
- Get all exchanges: `"exchanges"`
- Get total number of books: `"totalBooks"`
- Get total number of exchanges: `"totalExchanges"`

## Development

To modify or extend the dApp:

1. Edit the `index.js` file to add new features or modify existing ones.
2. Test your changes in the Cartesi Rollups environment.

## Notes

- Book IDs and exchange IDs are generated using timestamps.
- The dApp maintains an in-memory database of books and exchanges, which resets when the dApp is restarted.
- All payloads are automatically converted between hex and string formats by the dApp.
