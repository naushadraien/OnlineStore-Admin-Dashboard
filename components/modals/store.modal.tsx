"use client";

import { Modal } from "@/components/ui/modal";
import { useStoreModal } from "@/hooks/use-store-modal";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Store name must be at least 1 character.",
  }),
});

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values) => {
      try {
        // throw new Error("Something went wrong!");
        const res = await axios.post("/api/stores", values);
        // console.log(res.data);
        toast.success("Store created successfully!");
        return res.data;
      } catch (error) {
        toast.error("Something went wrong!");
      }
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values as any);
  };
  return (
    <Modal
      title="Create Store"
      description="Add a new store to manage products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.closeModal}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-2 pb-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="E-Commerce"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end items-center w-full pt-6 space-x-2">
            <Button
              disabled={isPending}
              variant="outline"
              onClick={storeModal.closeModal}
            >
              Cancel
            </Button>
            <Button disabled={isPending} className="" type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
