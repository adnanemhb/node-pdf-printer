const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");



(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Replace with the correct path
  });
  await browser.close();
})();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));

app.post("/generate-pdf", async (req, res) => {
  try {
    const { htmlContentArray } = req.body;
    if (!htmlContentArray || !Array.isArray(htmlContentArray)) {
      return res.status(400).send("HTML content array is required");
    }

    const combinedHtml = htmlContentArray
      .map((htmlContent) => {
        return `${htmlContent}<div style="page-break-after: always;"></div>`;
      })
      .join("");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(combinedHtml, { waitUntil: "networkidle0" });

    const pdfPath = path.join(__dirname, "output.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: {
        bottom: 10,
        top: 13,
        right: 25,
        left: 25,
      },
      printBackground: true,
    });

    await browser.close();

    res.download(pdfPath, "output.pdf", (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
