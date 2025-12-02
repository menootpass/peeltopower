/**
 * Google Apps Script untuk Database Authentication
 * 
 * Setup:
 * 1. Buat Google Spreadsheet baru
 * 2. Buat sheet dengan nama "Users" (atau sesuaikan)
 * 3. Di baris pertama, tambahkan header: Email | Username | Password
 * 4. Tambahkan data user di baris berikutnya
 * 5. Deploy sebagai Web App dengan execute as: Me, access: Anyone
 * 6. Copy Web App URL untuk digunakan di .env.local
 */

// Konfigurasi
const SPREADSHEET_ID = '1Rd_vUKMZaHEaN-oj5Mfbp6qzOLmJx2wEKbviG48G7Ew'; // Spreadsheet ID
const SHEET_NAME = 'Users'; // Nama sheet yang berisi data user
const PROJECTS_SHEET_NAME = 'Projects'; // Nama sheet yang berisi data projects

/**
 * Get spreadsheet
 */
function getSpreadsheet() {
  try {
    // Check if SPREADSHEET_ID is still placeholder
    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
      throw new Error('SPREADSHEET_ID belum dikonfigurasi. Silakan ganti YOUR_SPREADSHEET_ID dengan ID spreadsheet Anda.');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      throw new Error('Spreadsheet tidak ditemukan. Pastikan SPREADSHEET_ID benar dan Apps Script memiliki akses ke spreadsheet.');
    }
    
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan di spreadsheet. Pastikan nama sheet sesuai.');
    }
    
    // Check and add ProfilePhoto column if missing
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.indexOf('ProfilePhoto') === -1) {
      const lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1).setValue('ProfilePhoto');
      sheet.getRange(1, lastCol + 1).setFontWeight('bold');
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error in getSpreadsheet: ' + error.toString());
    throw error;
  }
}

/**
 * Get Projects sheet
 */
function getProjectsSheet() {
  try {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
      throw new Error('SPREADSHEET_ID belum dikonfigurasi.');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      throw new Error('Spreadsheet tidak ditemukan.');
    }
    
    let sheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(PROJECTS_SHEET_NAME);
      // Add headers: ID | Slug | Judul | Penulis | Konten | Gambar | Tanggal
      sheet.getRange(1, 1, 1, 7).setValues([['ID', 'Slug', 'Judul', 'Penulis', 'Konten', 'Gambar', 'Tanggal']]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    } else {
      // Check and reorganize columns to match expected structure: ID | Slug | Judul | Penulis | Konten | Gambar | Tanggal
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const expectedHeaders = ['ID', 'Slug', 'Judul', 'Penulis', 'Konten', 'Gambar', 'Tanggal'];
      const dataRows = sheet.getLastRow() - 1; // Exclude header
      
      // Check if headers match expected structure
      let headersMatch = true;
      if (headers.length !== expectedHeaders.length) {
        headersMatch = false;
      } else {
        for (let i = 0; i < expectedHeaders.length; i++) {
          if (headers[i] !== expectedHeaders[i]) {
            headersMatch = false;
            break;
          }
        }
      }
      
      // If headers don't match, reorganize
      if (!headersMatch) {
        // Get all existing data
        const allData = sheet.getDataRange().getValues();
        const oldHeaders = allData[0];
        const oldDataRows = allData.slice(1); // Exclude header row
        
        // Find old column indices
        const oldIdCol = oldHeaders.indexOf('ID');
        const oldSlugCol = oldHeaders.indexOf('Slug');
        const oldJudulCol = oldHeaders.indexOf('Judul');
        const oldPenulisCol = oldHeaders.indexOf('Penulis');
        const oldKontenCol = oldHeaders.indexOf('Konten');
        const oldGambarCol = oldHeaders.indexOf('Gambar');
        const oldTanggalCol = oldHeaders.indexOf('Tanggal');
        
        // Clear the sheet
        sheet.clear();
        
        // Set new headers
        sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
        sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold');
        
        // Reorganize data if there are existing rows
        if (oldDataRows.length > 0) {
          const newData = [];
          for (let i = 0; i < oldDataRows.length; i++) {
            const row = oldDataRows[i];
            const newRow = [];
            
            // ID - use existing ID if available, otherwise auto-increment
            if (oldIdCol >= 0 && row[oldIdCol]) {
              newRow.push(row[oldIdCol]);
            } else {
              newRow.push(i + 1);
            }
            
            // Slug - use existing slug if available, otherwise generate from title
            if (oldSlugCol >= 0 && row[oldSlugCol]) {
              newRow.push(row[oldSlugCol]);
            } else {
              const judul = oldJudulCol >= 0 && row[oldJudulCol] ? row[oldJudulCol].toString() : '';
              newRow.push(generateSlug(judul));
            }
            
            // Judul
            newRow.push(oldJudulCol >= 0 && row[oldJudulCol] ? row[oldJudulCol] : '');
            
            // Penulis
            newRow.push(oldPenulisCol >= 0 && row[oldPenulisCol] ? row[oldPenulisCol] : '');
            
            // Konten
            newRow.push(oldKontenCol >= 0 && row[oldKontenCol] ? row[oldKontenCol] : '');
            
            // Gambar
            newRow.push(oldGambarCol >= 0 && row[oldGambarCol] ? row[oldGambarCol] : '');
            
            // Tanggal
            newRow.push(oldTanggalCol >= 0 && row[oldTanggalCol] ? row[oldTanggalCol] : '');
            
            newData.push(newRow);
          }
          
          // Write reorganized data
          if (newData.length > 0) {
            sheet.getRange(2, 1, newData.length, expectedHeaders.length).setValues(newData);
          }
        }
      }
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error in getProjectsSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Generate slug from title
 * @param {string} title - Title to convert to slug
 * @return {string} Slug (lowercase, spaces replaced with hyphens)
 */
function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')   // Remove special characters except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Remove leading hyphens
    .replace(/-+$/, '');         // Remove trailing hyphens
}

/**
 * Get next available ID
 * @return {number} Next ID
 */
function getNextId() {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return 1;
    }
    
    const idCol = 1; // ID is always in column 1
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return 1; // No data rows, start with 1
    }
    
    // Get all IDs
    const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues().flat();
    const maxId = Math.max(...ids.filter(id => id && !isNaN(id)).map(id => Number(id)));
    
    return maxId >= 0 ? maxId + 1 : 1;
  } catch (error) {
    Logger.log('Error in getNextId: ' + error.toString());
    return 1;
  }
}

/**
 * Hash password sederhana (untuk production, gunakan library crypto yang lebih aman)
 * Catatan: Untuk keamanan lebih baik, simpan password yang sudah di-hash di spreadsheet
 */
function hashPassword(password) {
  // Simple hash - untuk production gunakan library crypto yang lebih aman
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @return {Object} User data if valid, null if invalid
 */
function verifyUser(email, password) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indices
    const emailCol = headers.indexOf('Email');
    const usernameCol = headers.indexOf('Username');
    const passwordCol = headers.indexOf('Password');
    const profilePhotoCol = headers.indexOf('ProfilePhoto');
    
    if (emailCol === -1 || passwordCol === -1) {
      return { error: 'Column not found. Make sure headers are: Email, Username, Password' };
    }
    
    // Search for user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol] ? row[emailCol].toString().toLowerCase().trim() : '';
      const rowPassword = row[passwordCol] ? row[passwordCol].toString() : '';
      
      if (rowEmail === email.toLowerCase().trim()) {
        // Compare password (plain text or hashed)
        // Jika password di spreadsheet sudah di-hash, gunakan hashPassword(password)
        // Jika masih plain text, langsung compare
        const passwordMatch = rowPassword === password || rowPassword === hashPassword(password);
        
        if (passwordMatch) {
          return {
            valid: true,
            user: {
              id: i.toString(), // Row number as ID
              email: row[emailCol].toString(),
              username: usernameCol !== -1 ? row[usernameCol].toString() : '',
              name: usernameCol !== -1 ? row[usernameCol].toString() : row[emailCol].toString(),
              profilePhoto: profilePhotoCol !== -1 && row[profilePhotoCol] ? row[profilePhotoCol].toString() : ''
            }
          };
        } else {
          return { valid: false, error: 'Invalid password' };
        }
      }
    }
    
    return { valid: false, error: 'User not found' };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Get all users (for admin purposes - optional)
 * @return {Array} Array of users
 */
function getAllUsers() {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const emailCol = headers.indexOf('Email');
    const usernameCol = headers.indexOf('Username');
    
    const users = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailCol]) {
        users.push({
          id: i.toString(),
          email: row[emailCol].toString(),
          username: usernameCol !== -1 ? row[usernameCol].toString() : '',
        });
      }
    }
    
    return { users: users };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Add new user (for registration - optional)
 * @param {string} email - User email
 * @param {string} username - Username
 * @param {string} password - User password
 * @return {Object} Success or error message
 */
function addUser(email, username, password) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    // Check if user already exists
    const verification = verifyUser(email, password);
    if (verification.valid) {
      return { error: 'User already exists' };
    }
    
    // Add new user
    const headers = sheet.getDataRange().getValues()[0];
    const emailCol = headers.indexOf('Email');
    const usernameCol = headers.indexOf('Username');
    const passwordCol = headers.indexOf('Password');
    
    const newRow = [];
    newRow[emailCol] = email;
    if (usernameCol !== -1) newRow[usernameCol] = username;
    if (passwordCol !== -1) {
      // Store hashed password (recommended)
      newRow[passwordCol] = hashPassword(password);
    }
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'User added successfully' };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Add new admin with profile photo
 * @param {string} email - Admin email
 * @param {string} username - Username
 * @param {string} password - Admin password
 * @param {string} profilePhoto - Profile photo URL (optional)
 * @return {Object} Success or error message
 */
function addAdmin(email, username, password, profilePhoto) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    // Check if user already exists by email
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const emailCol = headers.indexOf('Email');
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowEmail = row[emailCol] ? row[emailCol].toString().toLowerCase().trim() : '';
        if (rowEmail === email.toLowerCase().trim()) {
          return { error: 'Email sudah terdaftar' };
        }
      }
    }
    
    // Check if username already exists
    const headers = sheet.getDataRange().getValues()[0];
    const usernameCol = headers.indexOf('Username');
    if (usernameCol !== -1 && data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowUsername = row[usernameCol] ? row[usernameCol].toString().trim() : '';
        if (rowUsername === username.trim()) {
          return { error: 'Username sudah terdaftar' };
        }
      }
    }
    
    // Add new admin
    const emailCol = headers.indexOf('Email');
    const passwordCol = headers.indexOf('Password');
    const profilePhotoCol = headers.indexOf('ProfilePhoto');
    
    const newRow = [];
    newRow[emailCol] = email.trim();
    if (usernameCol !== -1) newRow[usernameCol] = username.trim();
    if (passwordCol !== -1) {
      // Store hashed password
      newRow[passwordCol] = hashPassword(password);
    }
    if (profilePhotoCol !== -1) {
      newRow[profilePhotoCol] = profilePhoto || '';
    }
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Admin berhasil ditambahkan',
      user: {
        email: email.trim(),
        username: username.trim(),
        profilePhoto: profilePhoto || ''
      }
    };
  } catch (error) {
    Logger.log('Error in addAdmin: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Add new project
 * @param {string} judul - Project title
 * @param {string} penulis - Project author
 * @param {string} konten - Project content
 * @param {Array} gambar - Array of image URLs
 * @return {Object} Success or error message
 */
function addProject(judul, penulis, konten, gambar) {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    // Get next ID
    const nextId = getNextId();
    
    // Generate slug from title
    const slug = generateSlug(judul);
    
    // Convert gambar array to JSON string
    const gambarJson = JSON.stringify(gambar || []);
    
    // Get current date in Indonesia timezone format
    const now = new Date();
    // Format: "25 Dec 2024, 14:30" (Indonesian format)
    const tanggal = Utilities.formatDate(now, Session.getScriptTimeZone(), 'd MMM yyyy, HH:mm');
    
    // Add new project: ID | Slug | Judul | Penulis | Konten | Gambar | Tanggal
    sheet.appendRow([nextId, slug, judul, penulis, konten, gambarJson, tanggal]);
    
    return { 
      success: true, 
      message: 'Project added successfully',
      id: nextId.toString(),
      slug: slug,
      data: {
        id: nextId.toString(),
        slug: slug,
        judul: judul,
        penulis: penulis,
        konten: konten,
        gambar: gambar || [],
        tanggal: tanggal
      }
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Get user profile photo by username
 * @param {string} username - Username to search for
 * @return {string} Profile photo URL or empty string
 */
function getUserProfilePhoto(username) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return '';
    }
    
    const headers = data[0];
    const usernameCol = headers.indexOf('Username');
    const profilePhotoCol = headers.indexOf('ProfilePhoto');
    
    if (usernameCol === -1 || profilePhotoCol === -1) {
      return '';
    }
    
    // Search for user by username
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowUsername = row[usernameCol] ? row[usernameCol].toString().trim() : '';
      
      if (rowUsername === username.toString().trim()) {
        return row[profilePhotoCol] ? row[profilePhotoCol].toString().trim() : '';
      }
    }
    
    return '';
  } catch (error) {
    Logger.log('Error in getUserProfilePhoto: ' + error.toString());
    return '';
  }
}

/**
 * Update user profile photo
 * @param {string} username - Username to update
 * @param {string} profilePhoto - Profile photo URL
 * @return {Object} Success or error message
 */
function updateUserProfilePhoto(username, profilePhoto) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No users found' };
    }
    
    const headers = data[0];
    const usernameCol = headers.indexOf('Username');
    const profilePhotoCol = headers.indexOf('ProfilePhoto');
    
    if (usernameCol === -1) {
      return { error: 'Username column not found' };
    }
    
    if (profilePhotoCol === -1) {
      return { error: 'ProfilePhoto column not found. Please ensure the column exists.' };
    }
    
    // Search for user by username
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowUsername = row[usernameCol] ? row[usernameCol].toString().trim() : '';
      
      if (rowUsername === username.toString().trim()) {
        // Update profile photo (row index is i+1 because data array is 0-indexed but sheet rows are 1-indexed)
        sheet.getRange(i + 1, profilePhotoCol + 1).setValue(profilePhoto);
        
        return {
          success: true,
          message: 'Profile photo updated successfully',
          username: username,
          profilePhoto: profilePhoto
        };
      }
    }
    
    return { error: 'User not found' };
  } catch (error) {
    Logger.log('Error in updateUserProfilePhoto: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Get all projects
 * @return {Array} Array of projects
 */
function getAllProjects() {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { projects: [] };
    }
    
    const headers = data[0];
    const idCol = headers.indexOf('ID');
    const slugCol = headers.indexOf('Slug');
    const judulCol = headers.indexOf('Judul');
    const penulisCol = headers.indexOf('Penulis');
    const kontenCol = headers.indexOf('Konten');
    const gambarCol = headers.indexOf('Gambar');
    const tanggalCol = headers.indexOf('Tanggal');
    
    // Validate column indices
    if (judulCol === -1 || penulisCol === -1 || kontenCol === -1 || gambarCol === -1) {
      return { error: 'Required columns not found in sheet. Expected: ID, Slug, Judul, Penulis, Konten, Gambar' };
    }
    
    const projects = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let gambar = [];
      
      // Parse gambar JSON string to array - only from gambarCol
      if (gambarCol >= 0 && row[gambarCol]) {
        try {
          const gambarValue = row[gambarCol].toString().trim();
          if (gambarValue) {
            gambar = JSON.parse(gambarValue);
            // Ensure it's an array
            if (!Array.isArray(gambar)) {
              gambar = [];
            }
          }
        } catch (e) {
          // If parsing fails, try to treat as single URL or empty
          const gambarValue = row[gambarCol].toString().trim();
          if (gambarValue && !gambarValue.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|GMT|\d{1,2}\/\d{1,2}\/\d{4})/i)) {
            // Only use if it doesn't look like a date
            gambar = [gambarValue];
          } else {
            gambar = [];
          }
        }
      }
      
      // Get ID from correct column
      let id = '';
      if (idCol >= 0 && row[idCol]) {
        id = row[idCol].toString().trim();
      } else {
        // Fallback to row number if ID column doesn't exist
        id = (i + 1).toString();
      }
      
      // Get slug from correct column
      let slug = '';
      if (slugCol >= 0 && row[slugCol]) {
        slug = row[slugCol].toString().trim();
      } else if (judulCol >= 0 && row[judulCol]) {
        // Generate slug from title if slug column doesn't exist
        slug = generateSlug(row[judulCol].toString());
      }
      
      // Get tanggal from correct column
      let tanggal = '';
      if (tanggalCol >= 0 && row[tanggalCol]) {
        tanggal = row[tanggalCol].toString().trim();
      }
      
      // Get profile photo for author
      const penulis = penulisCol >= 0 && row[penulisCol] ? row[penulisCol].toString() : '';
      const profilePhoto = penulis ? getUserProfilePhoto(penulis) : '';
      
      projects.push({
        id: id,
        slug: slug,
        judul: judulCol >= 0 && row[judulCol] ? row[judulCol].toString() : '',
        penulis: penulis,
        konten: kontenCol >= 0 && row[kontenCol] ? row[kontenCol].toString() : '',
        gambar: gambar,
        tanggal: tanggal,
        profilePhoto: profilePhoto
      });
    }
    
    return { projects: projects };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Get project by ID or slug
 * @param {string} id - Project ID or slug
 * @return {Object} Project data
 */
function getProjectById(id) {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No projects found' };
    }
    
    const headers = data[0];
    const idCol = headers.indexOf('ID');
    const slugCol = headers.indexOf('Slug');
    
    // Search for project by ID or slug
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Check by ID
      if (idCol >= 0 && row[idCol] && row[idCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        break;
      }
      // Check by slug
      if (slugCol >= 0 && row[slugCol] && row[slugCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        break;
      }
    }
    
    if (foundRow === -1) {
      return { error: 'Project not found' };
    }
    
    // Get column indices (headers and idCol, slugCol already defined above)
    const judulCol = headers.indexOf('Judul');
    const penulisCol = headers.indexOf('Penulis');
    const kontenCol = headers.indexOf('Konten');
    const gambarCol = headers.indexOf('Gambar');
    const tanggalCol = headers.indexOf('Tanggal');
    
    // Validate column indices
    if (judulCol === -1 || penulisCol === -1 || kontenCol === -1 || gambarCol === -1) {
      return { error: 'Required columns not found in sheet. Expected: ID, Slug, Judul, Penulis, Konten, Gambar' };
    }
    
    const row = data[foundRow]; // Use foundRow directly (already 0-indexed, excluding header)
    let gambar = [];
    
    // Parse gambar JSON string to array - only from gambarCol
    if (gambarCol >= 0 && row[gambarCol]) {
      try {
        const gambarValue = row[gambarCol].toString().trim();
        if (gambarValue) {
          gambar = JSON.parse(gambarValue);
          // Ensure it's an array
          if (!Array.isArray(gambar)) {
            gambar = [];
          }
        }
      } catch (e) {
        // If parsing fails, try to treat as single URL or empty
        const gambarValue = row[gambarCol].toString().trim();
        if (gambarValue && !gambarValue.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|GMT|\d{1,2}\/\d{1,2}\/\d{4})/i)) {
          // Only use if it doesn't look like a date
          gambar = [gambarValue];
        } else {
          gambar = [];
        }
      }
    }
    
    // Get ID from correct column
    let projectId = id;
    if (idCol >= 0 && row[idCol]) {
      projectId = row[idCol].toString().trim();
    }
    
    // Get slug from correct column
    let slug = '';
    if (slugCol >= 0 && row[slugCol]) {
      slug = row[slugCol].toString().trim();
    } else if (judulCol >= 0 && row[judulCol]) {
      // Generate slug from title if slug column doesn't exist
      slug = generateSlug(row[judulCol].toString());
    }
    
    // Get tanggal from correct column
    let tanggal = '';
    if (tanggalCol >= 0 && row[tanggalCol]) {
      tanggal = row[tanggalCol].toString().trim();
    }
    
    // Get profile photo for author
    const penulis = penulisCol >= 0 && row[penulisCol] ? row[penulisCol].toString() : '';
    const profilePhoto = penulis ? getUserProfilePhoto(penulis) : '';
    
    return {
      success: true,
      data: {
        id: projectId,
        slug: slug,
        judul: judulCol >= 0 && row[judulCol] ? row[judulCol].toString() : '',
        penulis: penulis,
        konten: kontenCol >= 0 && row[kontenCol] ? row[kontenCol].toString() : '',
        gambar: gambar,
        tanggal: tanggal,
        profilePhoto: profilePhoto
      }
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Update project
 * @param {string} id - Project ID
 * @param {string} judul - Project title
 * @param {string} penulis - Project author
 * @param {string} konten - Project content
 * @param {Array} gambar - Array of image URLs
 * @return {Object} Success or error message
 */
function updateProject(id, judul, penulis, konten, gambar) {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No projects found' };
    }
    
    const headers = data[0];
    const idCol = headers.indexOf('ID');
    const slugCol = headers.indexOf('Slug');
    const judulCol = headers.indexOf('Judul');
    const penulisCol = headers.indexOf('Penulis');
    const kontenCol = headers.indexOf('Konten');
    const gambarCol = headers.indexOf('Gambar');
    const tanggalCol = headers.indexOf('Tanggal');
    
    // Search for project by ID or slug
    let foundRow = -1;
    let projectId = id;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Check by ID
      if (idCol >= 0 && row[idCol] && row[idCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        projectId = row[idCol].toString().trim();
        break;
      }
      // Check by slug
      if (slugCol >= 0 && row[slugCol] && row[slugCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        if (idCol >= 0 && row[idCol]) {
          projectId = row[idCol].toString().trim();
        }
        break;
      }
    }
    
    if (foundRow === -1) {
      return { error: 'Project not found' };
    }
    
    const rowNum = foundRow + 1; // +1 because array is 0-indexed but row 1 is header
    
    // Generate new slug from title
    const newSlug = generateSlug(judul);
    
    const gambarJson = JSON.stringify(gambar || []);
    
    // Get existing tanggal (don't update it)
    let existingTanggal = '';
    if (tanggalCol >= 0) {
      existingTanggal = sheet.getRange(rowNum, tanggalCol + 1).getValue().toString();
    }
    
    // Update row: ID | Slug | Judul | Penulis | Konten | Gambar | Tanggal
    // ID doesn't change
    if (slugCol >= 0) {
      sheet.getRange(rowNum, slugCol + 1).setValue(newSlug);
    }
    if (judulCol >= 0) {
      sheet.getRange(rowNum, judulCol + 1).setValue(judul);
    }
    if (penulisCol >= 0) {
      sheet.getRange(rowNum, penulisCol + 1).setValue(penulis);
    }
    if (kontenCol >= 0) {
      sheet.getRange(rowNum, kontenCol + 1).setValue(konten);
    }
    if (gambarCol >= 0) {
      sheet.getRange(rowNum, gambarCol + 1).setValue(gambarJson);
    }
    // Tanggal tidak di-update, tetap menggunakan tanggal yang sudah ada
    
    return { 
      success: true, 
      message: 'Project updated successfully',
      data: {
        id: projectId,
        slug: newSlug,
        judul: judul,
        penulis: penulis,
        konten: konten,
        gambar: gambar || [],
        tanggal: existingTanggal
      }
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Delete project
 * @param {string} id - Project ID
 * @return {Object} Success or error message
 */
function deleteProject(id) {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No projects found' };
    }
    
    const headers = data[0];
    const idCol = headers.indexOf('ID');
    const slugCol = headers.indexOf('Slug');
    
    // Search for project by ID or slug
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Check by ID
      if (idCol >= 0 && row[idCol] && row[idCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        break;
      }
      // Check by slug
      if (slugCol >= 0 && row[slugCol] && row[slugCol].toString().trim() === id.toString().trim()) {
        foundRow = i;
        break;
      }
    }
    
    if (foundRow === -1) {
      return { error: 'Project not found' };
    }
    
    const rowNum = foundRow + 1; // +1 because array is 0-indexed but row 1 is header
    sheet.deleteRow(rowNum);
    
    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @return {Object} User data
 */
function getUserByEmail(email) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No users found' };
    }
    
    const headers = data[0];
    const emailCol = headers.indexOf('Email');
    const usernameCol = headers.indexOf('Username');
    const passwordCol = headers.indexOf('Password');
    const profilePhotoCol = headers.indexOf('ProfilePhoto');
    
    if (emailCol === -1) {
      return { error: 'Email column not found' };
    }
    
    // Search for user by email
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol] ? row[emailCol].toString().toLowerCase().trim() : '';
      
      if (rowEmail === email.toLowerCase().trim()) {
        return {
          success: true,
          user: {
            id: i.toString(),
            email: row[emailCol].toString(),
            username: usernameCol !== -1 ? row[usernameCol].toString() : '',
            name: usernameCol !== -1 ? row[usernameCol].toString() : row[emailCol].toString(),
            profilePhoto: profilePhotoCol !== -1 && row[profilePhotoCol] ? row[profilePhotoCol].toString() : ''
          }
        };
      }
    }
    
    return { error: 'User not found' };
  } catch (error) {
    Logger.log('Error in getUserByEmail: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Update username
 * @param {string} email - User email
 * @param {string} username - New username
 * @return {Object} Success or error message
 */
function updateUsername(email, username) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No users found' };
    }
    
    const headers = data[0];
    const emailCol = headers.indexOf('Email');
    const usernameCol = headers.indexOf('Username');
    
    if (emailCol === -1) {
      return { error: 'Email column not found' };
    }
    
    if (usernameCol === -1) {
      return { error: 'Username column not found' };
    }
    
    let oldUsername = '';
    
    // Search for user by email
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol] ? row[emailCol].toString().toLowerCase().trim() : '';
      
      if (rowEmail === email.toLowerCase().trim()) {
        // Get old username before updating
        oldUsername = row[usernameCol] ? row[usernameCol].toString().trim() : '';
        
        // Update username (row index is i+1 because data array is 0-indexed but sheet rows are 1-indexed)
        sheet.getRange(i + 1, usernameCol + 1).setValue(username.trim());
        
        // Update writer in all projects if username changed
        if (oldUsername && oldUsername !== username.trim()) {
          const updateResult = updateProjectsWriter(oldUsername, username.trim());
          if (updateResult.error) {
            Logger.log('Warning: Failed to update projects writer: ' + updateResult.error);
            // Don't fail the username update if project update fails
          }
        }
        
        return {
          success: true,
          message: 'Username updated successfully',
          username: username.trim()
        };
      }
    }
    
    return { error: 'User not found' };
  } catch (error) {
    Logger.log('Error in updateUsername: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Update writer in all projects when username changes
 * @param {string} oldUsername - Old username
 * @param {string} newUsername - New username
 * @return {Object} Success or error message
 */
function updateProjectsWriter(oldUsername, newUsername) {
  try {
    const sheet = getProjectsSheet();
    if (!sheet) {
      return { error: 'Projects sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, message: 'No projects to update', updated: 0 };
    }
    
    const headers = data[0];
    const penulisCol = headers.indexOf('Penulis');
    
    if (penulisCol === -1) {
      return { error: 'Penulis column not found' };
    }
    
    let updatedCount = 0;
    
    // Update all projects with matching writer
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const penulis = row[penulisCol] ? row[penulisCol].toString().trim() : '';
      
      if (penulis === oldUsername) {
        // Update writer (row index is i+1 because data array is 0-indexed but sheet rows are 1-indexed)
        sheet.getRange(i + 1, penulisCol + 1).setValue(newUsername);
        updatedCount++;
      }
    }
    
    return {
      success: true,
      message: 'Projects writer updated successfully',
      updated: updatedCount
    };
  } catch (error) {
    Logger.log('Error in updateProjectsWriter: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Update password
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @return {Object} Success or error message
 */
function updatePassword(email, newPassword) {
  try {
    const sheet = getSpreadsheet();
    if (!sheet) {
      return { error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No users found' };
    }
    
    const headers = data[0];
    const emailCol = headers.indexOf('Email');
    const passwordCol = headers.indexOf('Password');
    
    if (emailCol === -1) {
      return { error: 'Email column not found' };
    }
    
    if (passwordCol === -1) {
      return { error: 'Password column not found' };
    }
    
    // Search for user by email
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol] ? row[emailCol].toString().toLowerCase().trim() : '';
      
      if (rowEmail === email.toLowerCase().trim()) {
        // Hash and update password (row index is i+1 because data array is 0-indexed but sheet rows are 1-indexed)
        const hashedPassword = hashPassword(newPassword);
        sheet.getRange(i + 1, passwordCol + 1).setValue(hashedPassword);
        
        return {
          success: true,
          message: 'Password updated successfully'
        };
      }
    }
    
    return { error: 'User not found' };
  } catch (error) {
    Logger.log('Error in updatePassword: ' + error.toString());
    return { error: error.toString() };
  }
}

/**
 * Web App endpoint for login verification
 * Method: POST
 * Body: { email: string, password: string }
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const { email, password, action } = requestData;
    
    // Handle actions that don't require email/password
    if (action === 'getAllUsers') {
      const result = getAllUsers();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Projects CRUD operations
    if (action === 'getAllProjects') {
      const result = getAllProjects();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getProject') {
      const id = requestData.id;
      if (!id) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Project ID is required' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = getProjectById(id);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addProject') {
      const { judul, penulis, konten, gambar } = requestData;
      if (!judul || !penulis || !konten) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Judul, Penulis, dan Konten wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = addProject(judul, penulis, konten, gambar || []);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'updateProject') {
      const { id, judul, penulis, konten, gambar } = requestData;
      if (!id || !judul || !penulis || !konten) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'ID, Judul, Penulis, dan Konten wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = updateProject(id, judul, penulis, konten, gambar || []);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteProject') {
      const id = requestData.id;
      if (!id) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Project ID is required' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = deleteProject(id);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'updateUserProfilePhoto') {
      const { username, profilePhoto } = requestData;
      if (!username || !profilePhoto) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Username dan ProfilePhoto wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = updateUserProfilePhoto(username, profilePhoto);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getUserByEmail') {
      const email = requestData.email;
      if (!email) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Email wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = getUserByEmail(email);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'updateUsername') {
      const { email, username } = requestData;
      if (!email || !username) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Email dan Username wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = updateUsername(email, username);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'updatePassword') {
      const { email, newPassword } = requestData;
      if (!email || !newPassword) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Email dan NewPassword wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = updatePassword(email, newPassword);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getUserProfilePhoto') {
      const username = requestData.username;
      if (!username) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Username wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const profilePhoto = getUserProfilePhoto(username);
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, profilePhoto: profilePhoto || '' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addAdmin') {
      const { email, username, password, profilePhoto } = requestData;
      if (!email || !username || !password) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'Email, Username, dan Password wajib diisi' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      const result = addAdmin(email, username, password, profilePhoto || '');
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // For login and register, email and password are required
    if (!email || !password) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Email and password are required' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'login') {
      const result = verifyUser(email, password);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'register') {
      const username = requestData.username || '';
      const result = addUser(email, username, password);
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Invalid action' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web App endpoint for GET requests (for testing)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAllUsers') {
    const result = getAllUsers();
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getAllProjects') {
    const result = getAllProjects();
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getProject') {
    const id = e.parameter.id;
    if (!id) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Project ID is required' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    const result = getProjectById(id);
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ message: 'Google Apps Script API is running. Use POST method for login.' })
  ).setMimeType(ContentService.MimeType.JSON);
}


