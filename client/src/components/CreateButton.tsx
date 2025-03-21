import { useState } from 'react';
import CreateVideoModal from './CreateVideoModal';
import { Button } from '@/components/ui/button';

export default function CreateButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        className="fixed lg:bottom-10 bottom-[70px] right-5 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg z-40 p-0"
        onClick={handleOpenModal}
      >
        <i className="ri-add-line text-2xl"></i>
      </Button>
      
      {isModalOpen && (
        <CreateVideoModal onClose={handleCloseModal} />
      )}
    </>
  );
}
