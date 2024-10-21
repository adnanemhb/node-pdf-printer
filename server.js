const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import the CORS middleware

const app = express();
const port = 5000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Pre-flight requests
    }
    next();
});
// Middleware to parse JSON body
app.use(express.json({ limit: '100mb' })); // Increase limit as needed

// Function to generate PDF from HTML content
async function generatePDFfromHTML(htmlContent, outputPath) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: outputPath, format: 'A4' });
    await browser.close();
}

// POST route to receive HTML content and generate PDF
app.post('/generate-pdf', async (req, res) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).send('HTML content is required');
    }

    const outputPath = path.join(__dirname, 'output.pdf');

    try {
        await generatePDFfromHTML(htmlContent, outputPath);

        // Send the generated PDF file to the client
        res.sendFile(outputPath, err => {
            if (err) {
                return res.status(500).send('Error sending PDF');
            }
            // Optionally delete the PDF after sending it
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`PDF generation API listening at http://localhost:${port}`);
});