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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

interface SettingFormProps {
  initialData: Store;
}
const formSchema = z.object({
  name: z.string().min(1),
});

const SettingForm: React.FC<SettingFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  // console.log(params.storeId);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      try {
        const res = await axios.patch(`/api/stores/${params.storeId}`, values);
        router.refresh();
        toast.success("Updated Successfully!");
        return res.data;
      } catch (error) {
        toast.error("Something Went Wrong!");
      }
    },
    // onSuccess: (data) => console.log(data),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.delete(`/api/stores/${params.storeId}`);
        router.refresh();
        router.push("/");
        toast.success("Deleted Successfully!");
        return res.data;
      } catch (error) {
        toast.error("Make sure you removed all products and categories first!");
      }
    },
    // onSuccess: (data) => console.log(data),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values as any);
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
        <Heading title="Settings" description="Manage Store Preferences" />
        <Button
          disabled={updateMutation.isPending}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Store Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={updateMutation.isPending}
            type="submit"
            className="ml-auto"
          >
            Save Changes
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SettingForm;
