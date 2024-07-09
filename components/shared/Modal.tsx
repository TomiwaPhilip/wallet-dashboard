import Image from "next/image";
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

export function FullModal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-center items-center"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"
        onClick={onClose}
      ></div>
      <div
        className="bg-[#0E1018] text-white relative w-full h-full mx-auto my-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <Image
            src={"/assets/icons/add.svg"}
            alt="close"
            width={50}
            height={50}
          />
        </button>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};



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


