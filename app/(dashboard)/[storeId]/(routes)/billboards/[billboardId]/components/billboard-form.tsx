"use client";

import { ALertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";
interface BillboardFormProps {
  initialData: Billboard | null;
}
const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
});

const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  // console.log(params.storeId);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      imageUrl: "",
    },
  });

  const title = initialData ? "Edit billboard." : "Create billboard.";
  const description = initialData
    ? "Edit a billboard."
    : "Add a new billboard.";
  const toastMessage = initialData
    ? "Billboard Updated!"
    : "Billboard Created!";
  const actions = initialData ? "Save Changes" : "Create";

  const postorupdateMutation = useMutation({
    mutationFn: async (values) => {
      try {
        if (initialData) {
          const res = await axios.patch(
            `/api/${params.storeId}/billboards/${params.billboardId}`,
            values
          );
          toast.success(toastMessage);
          router.push(`/${params.storeId}/billboards`);
          router.refresh();
          return res.data;
        } else {
          const res = await axios.post(
            `/api/${params.storeId}/billboards`,
            values
          );
          toast.success(toastMessage);
          router.push(`/${params.storeId}/billboards`);
          router.refresh();
          return res.data;
        }
      } catch (error) {
        toast.error("Something Went Wrong!");
      }
    },
    // onSuccess: (data) => console.log(data),
    // onError: (data) => console.log(data),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.delete(
          `/api/${params.storeId}/billboards/${params.billboardId}`
        );
        toast.success("Billboard Deleted Successfully!");
        router.push(`/${params.storeId}/billboards`);
        router.refresh();
        return res.data;
      } catch (error) {
        toast.error(
          "Make sure you removed all categories using this billboard first!"
        );
      }
    },
    // onSuccess: (data) => console.log(data),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // console.log(values);

    postorupdateMutation.mutate(values as any);
  };

  const onDelete = () => {
    deleteMutation.mutate(params.storeId as any);
  };

  return (
    <>
      <ALertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={postorupdateMutation.isPending}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={postorupdateMutation.isPending}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Billboard Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={postorupdateMutation.isPending}
            type="submit"
            className="ml-auto"
          >
            {actions}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default BillboardForm;
