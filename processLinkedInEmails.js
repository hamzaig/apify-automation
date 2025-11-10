import XLSX from 'xlsx';
import { getEmailFromLinkedIn } from './services/linkedinService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Processes LinkedIn URLs from Excel file and adds emails
 */
async function processLinkedInEmails() {
    const excelFilePath = path.join(__dirname, 'data', 'LInkedin leadrock data without email.xlsx');
    
    try {
        // Read the Excel file
        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON for easier processing
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Found ${data.length} rows to process`);
        
        // Find the column name for LinkedIn URL (case-insensitive search)
        const linkedinUrlColumn = Object.keys(data[0] || {}).find(
            key => key.toLowerCase().includes('linkedin') && key.toLowerCase().includes('url')
        ) || Object.keys(data[0] || {}).find(
            key => key.toLowerCase().includes('linkedin')
        );
        
        if (!linkedinUrlColumn) {
            throw new Error('Could not find LinkedIn URL column in Excel file');
        }
        
        console.log(`Using column "${linkedinUrlColumn}" for LinkedIn URLs`);
        
        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const linkedinUrl = row[linkedinUrlColumn];
            
            // Skip if no LinkedIn URL or if email already exists
            if (!linkedinUrl || row['Email']) {
                console.log(`Row ${i + 1}: Skipping (no URL or email already exists)`);
                continue;
            }
            
            console.log(`Row ${i + 1}/${data.length}: Processing ${linkedinUrl}...`);
            
            try {
                const email = await getEmailFromLinkedIn(linkedinUrl);
                
                if (email) {
                    row['Email'] = email;
                    console.log(`  ✓ Email found: ${email}`);
                } else {
                    row['Email'] = '';
                    console.log(`  ✗ No email found`);
                }
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`  ✗ Error processing ${linkedinUrl}:`, error.message);
                row['Email'] = '';
            }
        }
        
        // Convert back to worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(data);
        
        // Update the workbook
        workbook.Sheets[sheetName] = newWorksheet;
        
        // Write the updated file
        console.log('\nWriting updated Excel file...');
        XLSX.writeFile(workbook, excelFilePath);
        
        console.log('✓ Excel file updated successfully!');
        
    } catch (error) {
        console.error('Error processing Excel file:', error);
        throw error;
    }
}

// Run the function
processLinkedInEmails().catch(console.error);

