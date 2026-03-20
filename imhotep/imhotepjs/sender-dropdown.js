// ========================
// sender-dropdown.js - PostMessage Version
// 102 lines
// ========================

// sender-dropdown.js - Updated to work with your Sender.net iframe
(function() {
    'use strict';
    
    const commentBtn = document.getElementById('open-cmt-modal');
    if (!commentBtn) {
        console.warn('⚠️ Comment button not found');
        return;
    }
    
    function extractKeyNumber(keyText) {
        if (!keyText) return null;
        const match = keyText.match(/Clé\s*(\d+)\.?/);
        return match ? match[1] : null;
    }
    
    // Function to find Sender iframe
    function findSenderIframe() {
        const iframes = document.querySelectorAll('iframe');
        for (let iframe of iframes) {
            // Check if this is likely the Sender iframe
            const src = iframe.src || '';
            if (src.includes('sender') || src.includes('sender.net') || iframe.id.includes('sender')) {
                return iframe;
            }
        }
        return null;
    }
    
    commentBtn.addEventListener('click', function() {
        const keyNumber = extractKeyNumber(window.currentImhotepKey);
        console.log('🔑 Selected key number:', keyNumber);
        
        if (!keyNumber) {
            console.warn('⚠️ No key number found');
            return;
        }
        
        // Try multiple times to find and update the iframe
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryUpdateIframe = setInterval(() => {
            attempts++;
            
            const senderIframe = findSenderIframe();
            
            if (senderIframe) {
                try {
                    // Try to access iframe content
                    const iframeDoc = senderIframe.contentDocument || senderIframe.contentWindow.document;
                    
                    // Look for your dropdown field
                    const numCleField = iframeDoc.querySelector('[name="num_cle"], [data-field="num_cle"]');
                    
                    if (numCleField) {
                        numCleField.value = keyNumber;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        numCleField.dispatchEvent(event);
                        
                        console.log('✅ Successfully set num_cle to:', keyNumber);
                        clearInterval(tryUpdateIframe);
                    } else {
                        // Try postMessage as fallback
                        senderIframe.contentWindow.postMessage({
                            type: 'setField',
                            field: 'num_cle',
                            value: keyNumber
                        }, '*');
                        console.log('📤 Sent postMessage to iframe');
                    }
                    
                } catch (e) {
                    // Cross-origin error - try postMessage instead
                    try {
                        senderIframe.contentWindow.postMessage({
                            type: 'setField',
                            field: 'num_cle',
                            value: keyNumber
                        }, '*');
                        console.log('📤 Sent postMessage (cross-origin)');
                    } catch (postError) {
                        console.log('❌ Cannot access iframe:', postError);
                    }
                }
            }
            
            if (attempts >= maxAttempts) {
                console.log('⏱️ Max attempts reached, stopping');
                clearInterval(tryUpdateIframe);
            }
            
        }, 500); // Check every 500ms
        
    });
})();