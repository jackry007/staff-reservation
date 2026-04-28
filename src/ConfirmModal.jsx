import React, { useEffect } from "react";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  return (
    <div className="modal-overlay">
      <div className="modal-card confirm-card">
        <h3 className="modal-title">Confirm Delete</h3>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button onClick={onCancel} className="modal-btn secondary">
            Cancel
          </button>

          <button onClick={onConfirm} className="modal-btn danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
