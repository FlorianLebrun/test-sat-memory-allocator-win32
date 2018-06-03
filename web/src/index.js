import React from "react"
import ReactDOM from "react-dom"
import Application, { Addons } from "react-application-frame"
import "./index.css"

import "bootstrap/dist/css/bootstrap.min.css"
window.jQuery = require("jquery/dist/jquery.min.js")
require("bootstrap/dist/js/bootstrap.min.js")

Application.installPlugin(Addons.WindowsFrame)
Application.installPlugin(Addons.Notification)
Application.installPlugin(Addons.Popup)
Application.installPlugin(Addons.Fetch, {
  endpoints: [
    {
      pattern: /^.*/,
      prepare: function (url, data): string {
        data.mode = "cors"
        return url
      },
    },
  ],
})
require("./plugin")

Application.configureLayout({
  displayLayout: {
    "#": {
      type: "#",
      child: "left",
    },
    "left": {
      type: "side-left",
      child: "bottom",
      size: 30,
    },
    "bottom": {
      type: "side-bottom",
      child: "right",
      size: 30,
    },
    "right": {
      type: "side-right",
      child: "center",
      size: 30,
    },
    "center": {
      type: "center-top",
      menu: true,
    },
  },
})

ReactDOM.render((<div style={{ margin: 0, padding: 0, width: "100vw", height: "100vh" }}>
  {Application.renderDisplayFrame()}
</div>), document.getElementById("root"))
