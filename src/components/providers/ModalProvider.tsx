"use client";

import React, { useState, createContext, useContext, ReactNode } from "react";

// Example using simple React state, could use Zustand for more complex needs

interface ModalContextType {
  isOpen: (modalId: string) => boolean;
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  modalData: (modalId: string) => any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalState {
  [modalId: string]: { isOpen: boolean; data?: any };
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalState>({});

  const openModal = (modalId: string, data: any = null) => {
    setModals((prev) => ({ ...prev, [modalId]: { isOpen: true, data } }));
  };

  const closeModal = (modalId: string) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { ...prev[modalId], isOpen: false },
    }));
    // Optional: Clean up data after close?
    // setTimeout(() => {
    //     setModals(prev => {
    //         const newState = { ...prev };
    //         if (newState[modalId] && !newState[modalId].isOpen) {
    //             delete newState[modalId]; // Remove entirely after transition maybe
    //         }
    //         return newState;
    //     });
    // }, 300); // Adjust delay
  };

  const isOpen = (modalId: string) => !!modals[modalId]?.isOpen;
  const modalData = (modalId: string) => modals[modalId]?.data;

  const value = { isOpen, openModal, closeModal, modalData };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* You might render common modal components here controlled by this state */}
      {/* e.g., <EditUserModal /> <ConfirmDeleteModal /> */}
    </ModalContext.Provider>
  );
}

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
