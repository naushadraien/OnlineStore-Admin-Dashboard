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
  return <div className="p-4">Root Page</div>;
};

export default SetupPage;
