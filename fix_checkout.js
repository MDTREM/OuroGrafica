const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/checkout/page.tsx');
try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Normalize line endings to LF for splitting, but we might want to preserve?
    // Let's split by regex which handles both
    const lines = content.split(/\r?\n/);

    console.log(`Total lines: ${lines.length}`);

    // Target Range: Lines 43 to 65 (1-based)
    // Index 42 to 64 (0-based)
    const startIdx = 42;
    const endIdx = 64;

    // Safety Check
    if (!lines[startIdx].trim().startsWith('// --- Script Injection') && !lines[startIdx + 1].trim().startsWith('useEffect')) {
        console.error('Safety check failed: Target lines do not look like the expected useEffect block.');
        console.log('Line 43:', lines[startIdx]);
        console.log('Line 44:', lines[startIdx + 1]);
        process.exit(1);
    }

    const newLogic = `    // --- Script Injection for Efí Card ---
    useEffect(() => {
        const accountId = process.env.NEXT_PUBLIC_EFI_ACCOUNT_ID;
        
        // If ID matches placeholder or is missing, log but Unblock UI
        if (!accountId || accountId.includes("INSERIR")) {
            console.error("Efí Account ID missing or invalid:", accountId);
            setScriptLoaded(true); 
            return;
        }

        const scriptId = 'efi-payment-token-script';
        
        // Check if already exists
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            // Check availability with a small retry
            const checkInterval = setInterval(() => {
                // @ts-ignore
                if (typeof window.$gn !== 'undefined') {
                    setScriptLoaded(true);
                    clearInterval(checkInterval);
                }
            }, 500);
            
            // Force unblock after 3s anyway
            setTimeout(() => {
                setScriptLoaded(true);
                clearInterval(checkInterval);
            }, 3000);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.async = true;
        
        // Random version buster as per Efí docs
        const v = parseInt(String(Math.random() * 1000000));
        script.src = \`https://api.efi.com.br/v1/ancillary/payment-token/\${accountId}/protect?v=\${v}\`;
        
        script.onload = () => {
            console.log("Efí Script Loaded");
            setScriptLoaded(true);
        };

        script.onerror = () => {
             console.error("Error loading Efí Script");
             setScriptLoaded(true); // Unblock UI anyway
        };

        document.head.appendChild(script);

        return () => {
             // Optional cleaning
        };
    }, []);`;

    const newLines = newLogic.split('\n');
    const deleteCount = endIdx - startIdx + 1;

    console.log(`Replacing ${deleteCount} lines starting at index ${startIdx}.`);

    // Splice: Remove old lines, insert new lines
    lines.splice(startIdx, deleteCount, ...newLines);

    // Join back
    const newContent = lines.join('\n'); // Standardize on LF, or use \r\n if specific? git autocrlf usually handles.

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('File updated successfully!');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
