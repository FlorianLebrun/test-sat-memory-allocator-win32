import React from "react"
import ReactDOM from "react-dom"
import Application from "react-application-frame"
import FetchAddon from "react-application-frame/addons/fetch"
import PopupAddon from "react-application-frame/addons/popup"
import NotificationAddon from "react-application-frame/addons/notification"
import WindowsFrameAddon from "react-application-frame/addons/windows-frame"
import "./index.css"

Application.installPlugin(NotificationAddon)
Application.installPlugin(PopupAddon)
Application.installPlugin(FetchAddon, {
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
Application.installPlugin(WindowsFrameAddon, {
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

require("./plugin")

ReactDOM.render(Application.layout.frame.renderFrameComponent(), document.getElementById("root"))
