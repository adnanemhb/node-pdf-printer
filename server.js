const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Endpoint to generate PDF
// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '100mb' })); // Increase limit if necessary

// Endpoint to generate PDF from HTML content sent in the request body
app.post('/generate-pdf', async (req, res) => {
    try {
        const { htmlContent } = req.body; // Get the HTML content from the request body

        if (!htmlContent) {
            return res.status(400).send('HTML content is required');
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Set the HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Create a PDF and save it temporarily
        const pdfPath = path.join(__dirname, 'output.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        // Send the PDF as a response
        res.download(pdfPath, 'output.pdf', (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(pdfPath); // Delete the file after sending it
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating PDF');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on {base}:${PORT}`);
});