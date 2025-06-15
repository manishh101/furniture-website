/**
 * DEPRECATED: This script is for backward compatibility only.
 * 
 * As of June 2025, images are stored in Cloudinary.
 * This script maintains legacy uploads directory for backward compatibility
 * with any old image references that haven't been migrated yet.
 */

const fs = require('fs');
const path = require('path');

// Define paths
const uploadsDir = path.join(__dirname, '../uploads');
const frontendPlaceholdersDir = path.join(__dirname, '../../manish-steel-final/public/placeholders');

console.log('DEPRECATED: Checking legacy uploads directory for backward compatibility...');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating legacy uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define placeholder mappings
const placeholderMappings = [
  { source: 'Beds.png', target: 'bed1.jpg' },
  { source: 'Tables.png', target: 'bed2.jpg' },
  { source: 'Chairs.png', target: 'chair1.jpg' },
  { source: 'Office-Chairs.png', target: 'chair2.jpg' },
  { source: 'Table.png', target: 'table1.jpg' },
  { source: 'Office-Desks.png', target: 'table2.jpg' }
];

// Copy placeholder images if needed
placeholderMappings.forEach(mapping => {
  const sourcePath = path.join(frontendPlaceholdersDir, mapping.source);
  const targetPath = path.join(uploadsDir, mapping.target);
  
  // Check if target file exists and has content
  const needsCopy = !fs.existsSync(targetPath) || 
                    fs.statSync(targetPath).size === 0;
  
  if (needsCopy && fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${mapping.source} to ${mapping.target}`);
    } catch (err) {
      console.error(`Error copying ${mapping.source} to ${mapping.target}:`, err);
    }
  }
});

// Create .gitkeep file to ensure directory is tracked in git
const gitkeepPath = path.join(uploadsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
}

console.log('Upload directory setup complete!'); 