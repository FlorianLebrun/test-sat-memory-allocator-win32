import Path from "path"
import express from "express"
import { WebxEngine, WebsocketResponse } from "node-webengine-hosting"

const testConfig = {
  cd: Path.join(process.cwd(), "../x64/Debug"),
  dll: {
    // Description of library with 'connect' function
    path: "./test_dll.dll",
    entryName: "test_sat_connect",
  },
  envs: {
    // Environment variables
    // "key":"value"
  },
  config: {
    // JSON configuration provided to 'connect' function
  }
}

const app = express()
const webxEngine = new WebxEngine()

process.on('exit', (code) => {
  webxEngine.handleEvent("exit")
})

app.use("/inspector", function (req, res, next) {
  if (req.upgrade) {
    console.log(">> mount-ide websocket")
    const ws = res.accept()
    const listener = function (type, data) {
      this.send(JSON.stringify({ type, data }))
    }.bind(ws)
    webxEngine.addEventListener(listener)
    ws.on("close", () => webxEngine.removeEventListener(listener))
    ws.send(JSON.stringify({ type: "start", data: {} }))
  }
  else next()
})

app.use("/inspector", webxEngine.dispatch)

app.use("/", express.static("../web/build"))

const server = app.listen(42000, function () {
  webxEngine.connect(testConfig, () => {
    const port = server.address().port
    console.log(`[connected: ${webxEngine.getName()}]`)
    console.log("Process " + process.pid + " is listening on " + port)
  })
}).on("upgrade", function (req, socket, head) {
  app.handle(req, WebsocketResponse(req, socket, head))
})
