"use client";
import { useEffect } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

const SetupPage = () => {
  const { openModal, isOpen } = useStoreModal((state) => state);
  useEffect(() => {
    if (!isOpen) {
      openModal();
    }
  }, [isOpen, openModal]);
  return null;
};

export default SetupPage;
