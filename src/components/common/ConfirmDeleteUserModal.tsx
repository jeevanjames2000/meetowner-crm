import React from "react";
import Button from "../../components/ui/button/Button";

interface ConfirmDeleteUserModalProps {
  isOpen: boolean;
  userName: string;
  description:string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteUserModal: React.FC<ConfirmDeleteUserModalProps> = ({
  isOpen,
  userName,
  description,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Confirm Delete
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {description} <strong>{userName}</strong>?
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-200"
          >
            No
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteUserModal;