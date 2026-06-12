const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const EXCEL_FILE = path.join(__dirname, 'submissions.xlsx');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the BTOUCH directory
app.use(express.static(__dirname));

/**
 * Appends a row of data to a specific sheet in submissions.xlsx
 * @param {string} sheetName - The name of the sheet (e.g. 'Internships', 'Contacts')
 * @param {object} rowData - The data row object to append
 */
function appendToExcel(sheetName, rowData) {
  let workbook;
  
  // Check if submissions.xlsx already exists
  if (fs.existsSync(EXCEL_FILE)) {
    try {
      workbook = xlsx.readFile(EXCEL_FILE);
    } catch (err) {
      console.error('Error reading excel file:', err);
      throw new Error('Could not read existing Excel file. It might be open in another application.');
    }
  } else {
    // Create a new workbook if it doesn't exist
    workbook = xlsx.utils.book_new();
  }

  let sheet = workbook.Sheets[sheetName];
  let existingData = [];

  if (sheet) {
    // Convert current sheet content to JSON array of objects
    existingData = xlsx.utils.sheet_to_json(sheet);
  }

  // Add the new row to the data array
  existingData.push(rowData);

  // Convert updated JSON data array back to sheet
  const newSheet = xlsx.utils.json_to_sheet(existingData);

  if (sheet) {
    // Replace the sheet with the updated sheet
    workbook.Sheets[sheetName] = newSheet;
  } else {
    // Append the sheet if it's new
    xlsx.utils.book_append_sheet(workbook, newSheet, sheetName);
  }

  // Save the workbook to disk
  try {
    xlsx.writeFile(workbook, EXCEL_FILE);
  } catch (err) {
    console.error('Error writing excel file:', err);
    throw new Error('Permission denied. Please ensure the Excel file is closed if you have it open.');
  }
}

// Route for Internship Applications submission
app.post('/api/internship', (req, res) => {
  const { full_name, email, phone, role, message } = req.value || req.body;

  if (!full_name || !email || !phone || !role || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const rowData = {
    'Timestamp': timestamp,
    'Full Name': full_name,
    'Email Address': email,
    'Phone Number': phone,
    'Target Role': role,
    'Cover Letter / Message': message
  };

  try {
    appendToExcel('Internships', rowData);
    console.log(`[Success] Internship submission appended to Excel for ${full_name}`);
    res.json({ success: true, message: 'Application saved successfully to local Excel sheet!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route for Contact Form submissions
app.post('/api/contact', (req, res) => {
  const { full_name, email, subject, message } = req.value || req.body;

  if (!full_name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const rowData = {
    'Timestamp': timestamp,
    'Full Name': full_name,
    'Email Address': email,
    'Subject': subject,
    'Message Content': message
  };

  try {
    appendToExcel('Contacts', rowData);
    console.log(`[Success] Contact form submission appended to Excel for ${full_name}`);
    res.json({ success: true, message: 'Contact message saved successfully to local Excel sheet!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Handle serving index.html on root route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`BTouch Local Web Server is now running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Submissions will save to: ${EXCEL_FILE}`);
  console.log(`========================================`);
});
