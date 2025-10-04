export default function PasswordModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-lg">
          Generate New Passwords
        </div>
        <div className="p-6 text-gray-700">
          <p>Are you sure you want to generate new passwords for all members?</p>
        </div>
        <div className="flex justify-end space-x-3 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}