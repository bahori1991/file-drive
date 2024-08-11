"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadIcon,
  EllipsisVertical,
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { formatRelative, subDays } from "date-fns";

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              削除済に移動したファイルは一定の時間経過後、自動で削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                // 削除の実行
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "メッセージ",
                  description: "ファイルを削除済に移動しました。",
                });
              }}>
              実行
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
            }}
            className="flex gap-1 cursor-pointer items-center font-light">
            <DownloadIcon className="w-4 h-4" /> ダウンロード
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toggleFavorite({
                fileId: file._id,
              });
            }}
            className="flex gap-1 cursor-pointer items-center font-light">
            {isFavorited ? (
              <div className="flex gap-1 items-center">
                <StarIcon fill="black" className="w-4 h-4" />
                お気に入りから削除
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4" />
                お気に入りに登録
              </div>
            )}
          </DropdownMenuItem>

          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.shouldDelete) {
                  restoreFile({
                    fileId: file._id,
                  });
                } else {
                  setIsConfirmOpen(true);
                }
              }}
              className="flex gap-1 cursor-pointer items-center">
              {file.shouldDelete ? (
                <div className="flex gap-1 cursor-pointer items-center font-light">
                  <UndoIcon className="w-4 h-4" />
                  元に戻す
                </div>
              ) : (
                <div className="flex gap-1 text-red-600 cursor-pointer items-center font-light">
                  <TrashIcon className="w-4 h-4" />
                  削除
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function getFileUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

// export function FileCard({
//   file,
//   favorites,
// }: {
//   file: Doc<"files">;
//   favorites: Doc<"favorites">[];
// }) {
//   const userProfile = useQuery(api.users.getUserProfile, {
//     userId: file.userId,
//   });

//   const typeIcons = {
//     image: <ImageIcon />,
//     pdf: <FileTextIcon />,
//     csv: <GanttChartIcon />,
//   } as Record<Doc<"files">["type"], ReactNode>;

//   const isFavorited = favorites.some(
//     (favorite) => favorite.fileId === file._id,
//   );

//   return (
//     <Card>
//       <CardHeader className="relative">
//         <CardTitle className="flex gap-2 text-base font-normal">
//           <div className="flex justify-center">{typeIcons[file.type]}</div>
//           {file.name}
//         </CardTitle>

//         <div className="absolute top-2 right-2">
//           <FileCardActions isFavorited={isFavorited} file={file} />
//         </div>
//         {/* <CardDescription>Card Description</CardDescription> */}
//       </CardHeader>
//       <CardContent>
//         {file.type === "image" && (
//           <Image
//             alt={file.name}
//             width="200"
//             height="100"
//             src={getFileUrl(file.fileId)}
//           />
//         )}
//         {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
//         {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
//       </CardContent>
//       <CardFooter className="flex justify-between">
//         <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
//           <Avatar className="w-6 h-6">
//             <AvatarImage src={userProfile?.image} />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>
//           {userProfile?.name}
//         </div>
//         <div className="text-xs">
//           Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
