export function showConfirmModal({ title, body, onConfirm }) {
  const root = document.getElementById("modal-root");
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <p>${body}</p>
      <div class="modal-actions">
        <button class="mode-button" data-action="cancel">Cancel</button>
        <button class="mode-button active" data-action="confirm">Confirm</button>
      </div>
    </div>
  `;
  const cleanup = () => {
    backdrop.remove();
  };
  backdrop.addEventListener("click", (event) => {
    const action = event.target.closest("button")?.dataset.action;
    if (!action) {
      return;
    }
    if (action === "confirm") {
      onConfirm();
    }
    cleanup();
  });
  root.appendChild(backdrop);
}
