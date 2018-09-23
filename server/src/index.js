import Path from "path"
import express from "express"
import cors from "cors"
import { WebxEngine, WebsocketResponse } from "node-webengine-hosting"
import { fs } from "node-webengine-hosting/dist/common";

let appDir = Path.join(process.cwd(), "../x64/Release")
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

const engine = new WebxEngine()
engine.connect(config)

const app = express()

// put cors middleware
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true)
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

app.use("/inspector", function (req, res, next) {
  console.log(req.url)
  if (!req.upgrade) {
    engine.dispatch(req, res)
  }
})

app.use("/", express.static("../web/build"))

const server = app.listen(9944, function () {
  const port = server.address().port
  console.log("Process " + process.pid + " is listening on " + port)
}).on("upgrade", function (req, socket, head) {
  app.handle(req, WebsocketResponse(req, socket, head))
})
