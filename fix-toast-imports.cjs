const fs = require('fs');
const path = require('path');

// Files that need toast import fixes
const filesToFix = [
  'src/pages/WriterMarketplace.tsx',
  'src/pages/PublisherMarketplace.tsx', 
  'src/pages/ManuscriptDetail.tsx',
  'src/pages/EditorMarketplace.tsx',
  'src/hooks/usePayments.js',
  'src/hooks/usePaymentHistory.js',
  'src/components/MpesaPayment.jsx'
];

function fixToastImports() {
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace useToast import with sonner
      content = content.replace(
        /import\s*{\s*useToast\s*}\s*from\s*["']@\/components\/ui\/use-toast[""];?/g,
        'import { toast } from "sonner";'
      );
      
      // Remove useToast hook usage
      content = content.replace(
        /const\s*{\s*toast\s*}\s*=\s*useToast\(\);?/g,
        ''
      );
      
      // Fix toast calls - convert from object syntax to function calls
      content = content.replace(
        /toast\(\s*{\s*title:\s*["']([^"']+)["'],?\s*description:\s*["']([^"']+)["'],?\s*}\s*\);?/g,
        'toast.success("$2");'
      );
      
      content = content.replace(
        /toast\(\s*{\s*title:\s*["']([^"']+)["'],?\s*description:\s*([^,}]+),?\s*variant:\s*["']destructive["'],?\s*}\s*\);?/g,
        'toast.error($2);'
      );
      
      content = content.replace(
        /toast\(\s*{\s*title:\s*["']([^"']+)["'],?\s*description:\s*([^,}]+),?\s*}\s*\);?/g,
        'toast.success($2);'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed toast imports in ${filePath}`);
    }
  });
}

fixToastImports();
console.log('Toast import fixes completed!'); 