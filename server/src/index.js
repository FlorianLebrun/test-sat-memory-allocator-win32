import Path from "path"
import express from "express"
import { CreateWebxEngine, WebxEngine, WebxSession, WebsocketResponse } from "node-webengine-hosting"
import { fs } from "node-webengine-hosting/dist/common";

let appDir

appDir = Path.join(process.cwd(), "../x64/Release")
if (!fs.existsSync(Path.join(appDir, "./test_dll.dll"))) {
  appDir = Path.join(process.cwd(), "../x64/Debug")
}

const config = {
  cd: process.cwd(),
  dll: {
    // Description of library with 'connect' function
    path: Path.join(appDir, "./test_dll.dll"),
    entryName: "test_sat_connect",
  },
  envs: {
    // Environment variables
    "PATH": `${appDir};${process.env["PATH"]}`,
  },
  config: {
    // JSON configuration provided to 'connect' function
  }
}

function openServer(session: WebxSession) {
  const app = express()

  console.log("openServer")
  app.use("/inspector", function (req, res, next) {
    console.log(req.url)
    if (req.upgrade) {
      console.log(">> mount-ide websocket")
      const ws = res.accept()
      const listener = function (type, data) {
        this.send(JSON.stringify({ type, data }))
      }.bind(ws)
      session.addEventListener(listener)
      ws.on("close", () => session.removeEventListener(listener))
      ws.send(JSON.stringify({ type: "start", data: {} }))
    }
    else {
      session.dispatch(req, res, next)
    }
  })

  app.use("/", express.static("../web/build"))

  const server = app.listen(42000, function () {
    const port = server.address().port
    console.log("Process " + process.pid + " is listening on " + port)
  }).on("upgrade", function (req, socket, head) {
    app.handle(req, WebsocketResponse(req, socket, head))
  })
}

CreateWebxEngine(config, (engine: WebxEngine) => {
  process.on('exit', (code) => {
    engine.handleEvent("exit")
  })
  engine.createMainSession(config, (session: WebxSession) => {
    openServer(session)
  })
})

