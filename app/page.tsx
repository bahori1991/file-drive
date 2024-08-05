"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useOrganization,
  useSession,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "ファイル名を入力してください。" })
    .max(200, { message: "ファイル名は200文字以内で入力してください。" }),
  file: z
    .custom<FileList>((val) => val instanceof FileList, {
      message: "ファイルを選択してください。",
    })
    .refine((files) => files.length > 0, {
      message: "ファイルを選択してください。",
    }),
});

export default function Home() {
  const { toast } = useToast();
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });

    const { storageId } = await result.json();

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
      });

      setIsFileDialogOpen(false);

      toast({
        variant: "success",
        title: "メッセージ",
        description: "ファイルのアップロードが完了しました。",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ファイルのアップロードに失敗しました。",
      });
    }
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">あなたのファイル</h1>

        <Dialog
          open={isFileDialogOpen}
          onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen);
            form.reset();
          }}>
          <DialogTrigger asChild>
            <Button onClick={() => {}}>ファイルをアップロード</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">ファイルのアップロード</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ファイルのタイトル</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel>ファイル</FormLabel>
                          <FormControl>
                            <Input type="file" {...fileRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="flex gap-1">
                      {form.formState.isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      アップロード
                    </Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}
    </main>
  );
}
