// Unified library - combines free + premium
async function loadLibrary() {
  const userEmail = getEmailFromSession(); // You need to implement this
  const lang = document.documentElement.lang || "en";
  
  // 1. Load free PDFs (from your biblio/ folders)
  const freeFiles = await fetch(`/library/biblio/${lang}/free/list.json`).then(r => r.json());
  
  // 2. Load premium files (if entitled)
  let premiumFiles = [];
  if (userEmail) {
    try {
      const response = await fetch(`/api/premium-files-list/${lang}?email=${userEmail}`);
      if (response.ok) {
        premiumFiles = await response.json();
      }
    } catch(e) {
      console.log("Not entitled or error");
    }
  }
  
  // 3. Render library with icons 🔓 / 🔒
  renderLibrary(freeFiles, premiumFiles, !!userEmail);
}

function renderLibrary(freeFiles, premiumFiles, isSubscribed) {
  const container = document.getElementById("library-container");
  
  // Show free files (always)
  freeFiles.forEach(file => {
    container.innerHTML += `
      <div class="library-item">
        <span>🔓</span>
        <a href="/library/biblio/${lang}/free/${file}">${file}</a>
      </div>
    `;
  });
  
  // Show premium files (only if subscribed)
  if (isSubscribed && premiumFiles.files) {
    premiumFiles.files.forEach(file => {
      container.innerHTML += `
        <div class="library-item premium">
          <span>🔒</span>
          <a href="${file.url}">${file.name}</a>
        </div>
      `;
    });
  } else if (!isSubscribed && premiumFiles.length > 0) {
    container.innerHTML += `<p>🔒 Premium content available with subscription</p>`;
  }
}

loadLibrary();