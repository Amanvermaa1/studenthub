import { useEffect, useState } from "react";
import { Alert, Check, Close } from "../Icons.jsx";

/* =====================================================
   TOASTS
   ===================================================== */

let toastListeners = [];
let toastSeq = 0;

function notify(message, type = "success") {
  const id = ++toastSeq;
  toastListeners.forEach((listener) => listener({ id, message, type }));
}

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = ({ id, message, type }) => {
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3600);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter((item) => item !== listener);
    };
  }, []);

  const dismiss = (id) =>
    setToasts((current) => current.filter((item) => item.id !== id));

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="toast-badge">
            {toast.type === "error" ? <Alert size={15} /> : <Check size={15} />}
          </span>
          <p>{toast.message}</p>
          <button
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Close size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export { notify, ToastHost };
