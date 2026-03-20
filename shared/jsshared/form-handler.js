// ========================
// form-handler.js
// Handles both Formspree and Sender.net submissions
// ========================

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('cmtForm');
  if (!form) return;

  // Get current key from imhotep.js (window.currentImhotepKey)
  const getCurrentKey = () => {
    return window.currentImhotepKey || document.getElementById('cle_display')?.value || '';
  };

  // Get comment count from localStorage or set to 0
  const getCommentCount = () => {
    let count = localStorage.getItem('imhotep_comment_count');
    if (!count) {
      count = 0;
      localStorage.setItem('imhotep_comment_count', count);
    }
    return parseInt(count);
  };

  // Increment comment count
  const incrementCommentCount = () => {
    let count = getCommentCount();
    count++;
    localStorage.setItem('imhotep_comment_count', count);
    return count;
  };

  // Get formatted date for Sender.net
  const getCurrentDate = () => {
    return new Date().toISOString();
  };

  form.addEventListener('submit', async function(e) {
    // Don't prevent default completely - let Formspree handle its own submission
    // But we need to send to Sender.net in parallel
    
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const message = document.getElementById('message')?.value || '';
    const numCle = getCurrentKey();
    
    // Prepare data for Sender.net
    const senderData = {
      email: email,
      name: name,
      fields: {
        num_cle: numCle,
        message: message,
        comment_count: getCommentCount() + 1, // new count after this comment
        last_comment_date: getCurrentDate()
      }
    };
    
    // Send to Sender.net (async, don't block form submission)
    if (window.sender && email) {
      try {
        // Subscribe the user to your list with custom fields
        // Replace 'YOUR_LIST_ID' with your actual Sender.net list ID
        window.sender('subscribe', {
          list: 'eV2XyW',  // ⚠️ REPLACE THIS WITH YOUR ACTUAL LIST ID
          email: email,
          name: name,
          fields: {
            num_cle: numCle,
            message: message,
            comment_count: getCommentCount() + 1,
            last_comment_date: getCurrentDate()
          }
        });
        console.log('Sender.net: Subscription initiated');
      } catch (error) {
        console.error('Sender.net error:', error);
      }
    } else if (!email) {
      console.log('Sender.net: No email provided, skipping subscription');
    } else if (!window.sender) {
      console.error('Sender.net: Library not loaded');
    }
    
    // Increment comment count in localStorage after successful submission
    // Note: This increments even if Sender.net fails - adjust if needed
    setTimeout(() => {
      incrementCommentCount();
    }, 1000);
    
    // Formspree will handle its own submission naturally
    // The form action should be set in HTML (currently it's not set!)
  });
});