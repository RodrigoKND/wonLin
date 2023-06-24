const express = require("express")
const router = express.Router()
const connect = require("../database/connect")
const crypto = require("crypto")
require("dotenv").config()
router.get("/", (req, resp,) => {
    const cookie = req.headers.cookie;
    let decrypted = ""
    if (cookie) {
        const cookieParts = cookie.split(";").map(part => part.trim());
        const cookieValue = cookieParts.find(part => part.startsWith("n="));
        if (cookieValue) {
            const iv = Buffer.from(cookieValue.slice(2, 34), "hex");
            const decipher = crypto.createDecipheriv("aes-256-cbc", process.env.private_key, iv);
            let decryptedData = decipher.update(cookieValue.slice(34), "hex", "utf-8");
            decryptedData += decipher.final("utf-8");
            decrypted = decryptedData
        }
    }else{
        decrypted = "cookie_empty"
    }
    const queryImages = "SELECT * FROM userImages"
    const queryCom = "SELECT * FROM comment"
    let data = " "
    let comm = " "
    connect.query(queryImages, (err, data) => {
        if (err){
            resp.send("Lo siento...Estamos trabajando para solucionarlo") 
            data = data
            return;
        }
        connect.query(queryCom, (err, comm) => {
            if(err) resp.send("Lo siento...Estamos trabajando para solucionarlo")
            comm = comm
            return;
        })
    })
    resp.render("index", { data, comm,decrypted})
})
router.get("/login", (req, resp) => { resp.render("login") })
router.get("/new", (req, resp) => {
    let uuser = {}
    let count;
    const random = Math.round(Math.random())
    count = random
    if (count === 0) count++
    const querySelect = "SELECT name FROM users"
    connect.query(querySelect, (err, user) => {
        for (let uname of user) {
            const param = uname.name
            uuser[param] = param
        }
        const uu = JSON.stringify(uuser)
        resp.render("new", { uu, count })
    });

})

module.exports = router