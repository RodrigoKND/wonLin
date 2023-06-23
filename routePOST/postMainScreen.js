const express = require("express")
const router = express.Router()
const crypto = require("crypto")
require("dotenv").config()
const connect = require("../database/connect")

router.post("/post/comment", (req, resp) => {
    const comment = req.body.coment
    const id = Number(req.body.ifImg)
    const cookieID = req.headers.cookie
    let decrypted = ""
    if (cookieID) {
        const cookieParts = cookieID.split(";").map(part => part.trim());
        const cookieValue = cookieParts.find(part => part.startsWith("n="));
        if (cookieValue) {
            const iv = Buffer.from(cookieValue.slice(2, 34), "hex");
            const decipher = crypto.createDecipheriv("aes-256-cbc", process.env.private_key, iv);
            let decryptedData = decipher.update(cookieValue.slice(34), "hex", "utf-8");
            decryptedData += decipher.final("utf-8");
            decrypted = decryptedData
        }
    } else decrypted = "cookie_empty"
    if (typeof cookieID === "undefined") resp.send("Debes tener una cuenta para publicar un comentario")
    const querySelect = "SELECT id FROM users WHERE name=?"
    const queryComment = `
    INSERT INTO 
    comment(contentComment,id_com_user, id_image_com) 
    VALUES(?,?,?)`
    connect.query(querySelect, [decrypted], (err, res) => {
        if (err) resp.send("Tuvimos algunos problemas, por favor...vuelva a intentarlo")
        else {
            connect.query(queryComment, [comment, res[0].id, id], (err, data) => {
                if (err) resp.send("No se pudo escribir su comentario")

                resp.redirect(`/photo/${id}`)
            })
        }
    })
})
router.post("/auth", (req, resp) => {
    const { name, emailUser, passwd } = req.body
    const random = crypto.randomBytes(16).toString();
    const encryptPass = crypto.pbkdf2Sync(passwd, random, 10000, 64, "sha256").toString("hex");
    const querySelect = "SELECT name FROM users"
    connect.query(querySelect, (err, nameU) => {
        if (err) resp.send("Ups...problemas, vuelva a intentarlo")
        else {
            nameU.forEach(userName => {
                if (userName.name === name) resp.send("El nombre de usuario ya existe")
            })

            const queryInsert = "INSERT INTO users(name,email,password,salt) VALUES(?,?,?,?)"
            connect.query(queryInsert, [name, emailUser, encryptPass, random], (error, result) => {
                if (error) resp.status(400).send("Ups...Try it again")
                resp.render("login")
            })
        }
    })
})
router.post("/recUser", (req, resp) => {
    const iv = crypto.randomBytes(16)
    const { emailUser, passwd } = req.body
    const querySelectFields = "SELECT * FROM users WHERE email=?"
    connect.query(querySelectFields, emailUser, (error, result) => {
        if(error) resp.send("Existió un error, pruebelo nuevamente...")
        if (result.length === 0) {
            resp.render("login", {
                iconAlert: "error",
                titleAlert: "Ups...",
                textAlert: "Ups... Intentelo nuevamente...Hubo un error",
                alert: true
            })
        }
        else {
            const cryp = crypto.pbkdf2Sync(passwd, result[0].salt,10000,64,"sha256").toString("hex")
            if (result[0].password === cryp) {
                const cipher = crypto.createCipheriv("aes-256-cbc",process.env.private_key,iv)
                let encryptName = cipher.update(result[0].name, "utf-8","hex")
                encryptName += cipher.final("hex")
                const cookieValue = iv.toString("hex") + encryptName
                resp.cookie("n", cookieValue, {
                    expires: new Date(Date.now() + 20 * 3600000),
                    httpOnly: true,
                    secure: true
                }).redirect("/")
            } else {
                resp.render("login", {
                    iconAlert: "error",
                    titleAlert: "Incorrecto",
                    textAlert: "Email y/o contraseña son incorrectos",
                    alert: true
                })
            }
        }
    })
})

router.post("/logOut", (req, resp) => resp.clearCookie("n").redirect("/"))

module.exports = router