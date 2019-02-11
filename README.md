## AMO Block Explorer
Block explorer for AMO

### Environment
- `create-react-app`: v2.1.2

### Quick-start
- Install [node.js](https://nodejs.org/en/) (recommend LTS)
- Install `create-react-app` by running:
```bash
npm install create-react-app
```
- Run the app
```bash
npm start
```
- In MacOS, a chrome browser will start automatically.
    - TODO: What about other OS?
- TODO: Add production build steps.

### Development
- Subscribe block events including new block event and new tx event via websocket JSON RPC
- Show block information (hash, height, number of tx, timestamp, parent hash, miner)
- Show tx information (hash, from, to, timestamp, amount, block hash)
