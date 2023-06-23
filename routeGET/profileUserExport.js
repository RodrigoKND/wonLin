const express = require("express")
const router = express.Router()
const connect = require("../database/connect")
const PDFdocument = require("pdfkit")

const generatePDF=(doc, images)=>{
    for (let i = 0; i < images.length; i++) {
        const data = images[i].dataImg
        doc.image(data, 0, 15, { width: 200 })
        doc.addPage()
        doc.moveDown(1)
    }
}
router.get("/download/images", (req, resp) => {
    const queryImages = "SELECT * FROM userImages";
    connect.query(queryImages, (err, res) => {
        if (err) resp.send("No se pudo descargar... Intentelo de nuevo")
        const pdf = new PDFdocument()
        resp.setHeader("Content-Type", "application/pdf")
        resp.setHeader("Content-Disposition", 'attachment; filename="portfolio.pdf"')
        generatePDF(pdf, res)
        pdf.pipe(resp)
        pdf.end()
    })
})

module.exports = router