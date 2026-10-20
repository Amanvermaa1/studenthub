import { useEffect } from "react";
import { Trash } from "../Icons.jsx";

/* =====================================================
   CONFIRM DIALOG
   ===================================================== */

function ConfirmDialog({ request, onCancel, onConfirm }) {
  useEffect(() => {
    if (!request) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, onCancel]);

  if (!request) return null;

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="dialog-icon">
          <Trash size={22} />
        </span>
        <h3 id="confirm-title">{request.title}</h3>
        <p>{request.body}</p>
        <div className="dialog-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {request.confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
