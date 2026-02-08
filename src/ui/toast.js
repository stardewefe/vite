export function pushToast(container, { title, body, icon }) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span>${icon || "⭐"}</span>
    <div>
      <div>${title}</div>
      <div class="badge">${body}</div>
    </div>
  `;
  container.prepend(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}
