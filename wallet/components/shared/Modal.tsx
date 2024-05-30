import React, { useState, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean | null;
  onClose: () => void;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto backdrop-filter backdrop-blur-lg flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-[#0E1018] rounded-2xl p-8 text-white relative w-full max-w-md border-2 border-[#979EB8]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Open Modal</button>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2>This is a modal</h2>
        <p>Click the button below to close the modal.</p>
        <button onClick={handleCloseModal}>Close Modal</button>
      </Modal>
    </div>
  );
};
