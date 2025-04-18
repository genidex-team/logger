# Logger

A lightweight custom logger for Node.js applications, designed to enhance standard `console.log`, `console.warn`, and `console.error` outputs with file name and line number of the log origin.

## ✨ Features

- Overrides built-in `console` methods to automatically display:
  - File path
  - Line and column number of the call
- Simple usage: just `require` it at the entry point of your app.
- Easy to disable via environment variable.

## 🛠 Installation

```bash
npm i @genidex/logger
```

## ⚙ Usage

Import the logger at the top of your application (e.g., in `hardhat.config.js` or any Node.js script):

```js
require('@genidex/logger');
console.log("Deploying contract...");
```

**Output:**

```bash
Deploying contract...      src/deploy/deploy.js:42:17
```

## 🔒 Environment Control

Disable the logger by setting the following environment variable:

```env
DISABLE_LOGGER=true
```

This is useful in production or when detailed logs are not needed.

## 🧪 Testing

Just run any Node.js file after requiring the logger and check the terminal output.


## 📜 License

MIT License