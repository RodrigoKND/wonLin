const express = require("express")
const router = express.Router()
const connect = require("../database/connect")
require("dotenv").config()
const crypto = require("crypto")
const https = require("https")
const path = require("path")
router.get("/register", (req, resp) => {
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
    if (typeof cookieID === "undefined") resp.send("Error de ruta")
    const queryFirst = "SELECT * FROM users"
    const query = "SELECT * FROM userImages"
    connect.query(queryFirst, (error, res) => {
        let idUSER = ""
        let nameUser = ""
        for (let i = 0; i < res.length; i++) {
            if (res[i].name === decrypted) {
                idUSER = res[i].id
                nameUser = decrypted
            } else resp.send("Ups...problema de ruteo")
            break
        }
        let idRelation = idUSER
        connect.query(query, (error, data) => {

            resp.render("register", { data, idRelation, nameUser })
        })
    })

})
router.get("/giphPresentation", (req, resp) => {
    const apiKEY = process.env.api_key_GIF
    try {
        const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKEY}&limit=20`;
        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const trendingData = JSON.parse(data);
                resp.render('GIF', { trending: trendingData });
            });
        });
    } catch (error) {
        resp.status(500).send('Error al obtener los GIFs de tendencia');
    }
})
router.get("/post/update/:id_Image/", (req, resp) => {
    const param = req.params.id_Image
    connect.query("select * from userImages", (err, res) => {
        if (err) {
            resp.send("Hubo un error")
        } else {
            for (let idImage = 0; idImage < res.length; idImage++) {
                if (res[idImage].id_Image === Number(param)) {
                    const { urlImg, contentCard, colorCard, twitter, insta, colorText } = res[idImage]
                    resp.render("update", {
                        param, urlImg, contentCard, colorCard,
                        twitter, insta, colorText
                    }
                    )
                }
            }
        }
    })
})
router.get("/photo/:idImage", (req, resp) => {
    const param = Number(req.params.idImage)
    const queryImages = "SELECT * FROM userImages"
    connect.query(queryImages, (err, data) => {
        if (err) resp.send("Ups...No se pudo obtener la imagen")
        else {
            data.forEach(img => {
                connect.query("SELECT * FROM users", (err, u) => {
                    connect.query("SELECT * fROM comment", (err, comment) => {
                        if (img.id_Image === param) {
                            resp.render("comments", { img, comment, u })
                        }
                    })
                })
            })
        }
    })
})
router.get("/post", (req, resp) => { resp.render("Post") })

router.get("/download/:name",(req,resp)=>{
    const param = req.params.name
    const dirName = path.dirname(__dirname)
    const join = path.join(dirName,"imagesPublic",param)
    resp.download(join,err=>{
        if(err) resp.send("No se pudo descargar la imagen...Pruebelo más tarde")
    })
})

module.exports = router