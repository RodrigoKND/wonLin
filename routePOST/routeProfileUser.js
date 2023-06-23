const express = require("express")
const router = express.Router()
const connect = require("../database/connect")
require("dotenv").config()
const https = require("https")
const crypto = require("crypto")
const cloudinary = require("../database/cloudinary")
const path = require("path")
router.post("/searched", (req, resp) => {
    const { gifSearched } = req.body
    const apiKEY = process.env.api_key_GIF
    try {
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKEY}&q=${gifSearched}&limit=20`
        console.log(url)
        https.get(url, (response) => {
            let data = ''
            response.on('data', (chunk) => {
                data += chunk
            })
            response.on('end', () => {
                const trendingData = JSON.parse(data)
                resp.render('GIF', { trendingData })
            })
        })
    } catch (error) {
        resp.status(500).send('Error al obtener los GIFs de tendencia')
    }
})

router.post("/upload", (req, resp) => {
    const { description, color_card, color_text, instagram_url, twitter_url } = req.body
    const mimeImage = ["image/jpg", "image/jpeg", "image/png"]
    const { mimetype, name, size, tempFilePath } = req.files.valueFile
    if (mimeImage.includes(mimetype) && size < 50000000000 && description) {
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
        connect.query("SELECT * FROM users", (error, result) => {
            let idUSER = ''
            for (let i = 0; i < result.length; i++) {
                if (result[i].name === decrypted) idUSER = result[i].id
            }
            const idRelation = idUSER
            cloudinary.v2.uploader.upload(tempFilePath, { folder: "uploadUser" }, (err, response) => {
                // const nameReplace = name.replace(name, "imageUser")
                const queryInsert = `INSERT INTO userImages(nameImg,contentCard,colorCard, 
                 colorText,socialMediaInstagram,socialMediaTwitter,urlImg,publicId,id_user) VALUES(?,?,?,?,?,?,?,?,?)`
                let valuesTables = [
                    name,
                    description,
                    color_card,
                    color_text,
                    instagram_url,
                    twitter_url,
                    response.secure_url,
                    response.public_id,
                    idRelation
                ]
                connect.query(queryInsert, valuesTables, (err, res) => {
                    if (err) resp.send("No se pudo subir la imagen")
                    const dirNameOrigin = path.dirname(__dirname)
                    console.log(response)
                    const routeImg = path.join(dirNameOrigin,"imagesPublic",name)
                    req.files.valueFile.mv(routeImg, (err) => {
                        if (err) resp.send("Existió un error al cargar el archivo"),console.log(err)
                        resp.redirect("/register")
                    })
                })
        })
    })
    }
    else { resp.send("Archivo no permitido") }
});

router.post("/update/:id", async (req, resp) => {
    const { description, color_card, color_text, instagram_url, twitter_url } = req.body
    const mimeImage = ["image/jpg", "image/jpeg", "image/png"]
    const { mimetype, name, size, tempFilePath } = req.files.valueImage
    const param = req.params.id
    if (mimeImage.includes(mimetype) && size < 50000000000 && description) {
        const nameReplace = name.replace(name, "imageUser")
        try {
            let idPublic;
            connect.query("SELECT * FROM userImages", (err, resData) => {
                resData.forEach(id => {
                    if (id.id_Image === Number(param)) idPublic = id.publicId
                })
                cloudinary.v2.uploader.destroy(idPublic)
            })
            await cloudinary.v2.uploader.upload(tempFilePath, { folder: "uploadUser" }).then(res => {
                const queryUpdate = `UPDATE userImages SET ? WHERE id_Image = ?`
                const valuesTables = [
                    {
                        nameImg: nameReplace,
                        contentCard: description,
                        colorCard: color_card,
                        colorText: color_text,
                        socialMediaInstagram: instagram_url,
                        socialMediaTwitter: twitter_url,
                        urlImg: res.secure_url,
                        publicId: res.public_id
                    },
                    param
                ]
                connect.query(queryUpdate, valuesTables, (error, result) => {
                    if (error) resp.send("No se pudo actualizar, pruebelo más tarde")
                    const dirNameOrigin = path.dirname(__dirname)
                    const routeImg = path.join(dirNameOrigin, "imagesPublic", name)
                    req.files.valueImage.mv(routeImg, (err) => {
                        if (err) resp.send("Existió un error al cargar el archivo")
                        resp.redirect("/register")
                    })
                })
            })
        } catch (err) {
            resp.send("Error para actualizar...pruebe nuevamente")
        }
    }
    else resp.send("Archivo no permitido")
})

router.post("/remove/:id_image", (req, resp) => {
    const param = Number(req.params.id_image)
    connect.query("SELECT * FROM userImages", (err, resData) => {
        resData.forEach(id => {
            if (id.id_Image === Number(param)) cloudinary.v2.uploader.destroy(id.publicId)
        })
    })
    const queryRemove = "DELETE FROM userImages WHERE id_Image = ?"
    const queryRemoveComments = "DELETE FROM comment WHERE id_image_com=?"
    connect.query(queryRemove, param, (err, res) => {
        if (err) resp.send("No se pudo eliminar...Intentelo nuevamente")
        connect.query(queryRemoveComments,param,(err,res)=>{
            if(err) resp.send("No se pudo eliminar...Estamos trabajando para solucionarlo")
            resp.redirect("/register")
        })
        
    })
})

module.exports = router