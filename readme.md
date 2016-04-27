# minimal-express

A starting point for a Node express.js app.

- Runs as a daemon using forever.
- Restart on crash using forever.
- Restart on modifications to .env using nodemon.
- Loads .env files using dotenv.

Additional things that would make things more like using Heroku:

- Should load the .env file automatically, without needing dotenv.
- GitHub hook for push updates, and running npm install on update.
- Web interface for starting/stopping.
- Web interface for changing .env

## Installation

```
$ npm install -g forever nodemon
```

## Start and stop

To start, run the following command and type `ctrl-c`.

```
$ npm start
...
^C
```

```
$ npm stop
```