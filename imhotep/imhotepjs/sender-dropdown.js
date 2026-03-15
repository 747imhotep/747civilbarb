// ========================
// sender-dropdown.js - PostMessage Version
// ========================

(function() {
    const commentBtn = document.getElementById('imhotep-comment-btn');
    if (!commentBtn) return;
    
    function extractKeyNumber(keyText) {
        if (!keyText) return null;
        const match = keyText.match(/Clé\s*(\d+)\.?/);
        return match ? match[1] : null;
    }
    
    commentBtn.addEventListener('click', function() {
        const keyNumber = extractKeyNumber(window.currentImhotepKey);
        console.log('Selected key:', keyNumber);
        
        if (!keyNumber) return;
        
        // Wait for iframe to appear
        setTimeout(() => {
            // Find all iframes
            const iframes = document.querySelectorAll('iframe');
            console.log('Found', iframes.length, 'iframes');
            
            iframes.forEach((iframe, index) => {
                console.log(`Iframe ${index} src:`, iframe.src);
                
                // Send message to every iframe that might be Sender
                try {
                    iframe.contentWindow.postMessage({
                        type: 'setField',
                        field: 'num_cle',
                        value: keyNumber
                    }, '*');
                    
                    console.log(`✅ Sent postMessage to iframe ${index}`);
                } catch (e) {
                    console.log(`Cannot send to iframe ${index}:`, e);
                }
            });
        }, 3000);
    });
})();