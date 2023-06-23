const express = require("express")
const app = express()
require("dotenv").config()
const fileUpload = require("express-fileupload")
const router = require("./routeGET/mainScreen")
const profileUser = require("./routeGET/profileUser")
const pdfExport = require("./routeGET/profileUserExport")
const mainScreenPOST = require("./routePOST/postMainScreen")
const routeProfile = require("./routePOST/routeProfileUser")
app.set("view engine", "ejs")
app.set("views", __dirname + "/public")
app.disable("X-Powered-By")
app.use(express.static("public", {
    setHeaders: (res, path, next) => {
        if (path.endsWith(".css")) res.set("Content-Type", "text/css")
    }
}))
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({ createParentPath: true, useTempFiles: true }))
app.use(router)
app.use(profileUser)
app.use(mainScreenPOST)
app.use(pdfExport)
app.use(routeProfile)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Servidor en ${PORT}`) })