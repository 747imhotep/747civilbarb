// ===============================================================
// Character Count for Comment Textarea
// =================================

const textarea = document.getElementById("message");
const counter = document.getElementById("charCount");

if (textarea && counter) {
  const max = textarea.maxLength;

  textarea.addEventListener("input", () => {
    const length = textarea.value.length;

    counter.textContent = `${length} / ${max}`;
    counter.style.color = length > max * 0.9 ? "#ff9999" : "#aaa";
  });
}