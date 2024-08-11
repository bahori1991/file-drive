import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useSession,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <div className="relative z-10 border-b py-4 bg-gray-50">
        <div className="items-center container mx-auto justify-between flex">
          <Link href={"/"} className="flex gap-2 items-center text-xl">
            <Image
              src="/logo.svg"
              width={"40"}
              height={"40"}
              alt="file-drive logo"
            />
            FileDrive
          </Link>

          <SignedIn>
            <Button variant={"outline"}>
              <Link href="/dashboard/files">ファイル</Link>
            </Button>
          </SignedIn>

          <div className="flex gap-2">
            <OrganizationSwitcher />
            <UserButton />
            <SignedOut>
              <SignInButton>
                <Button>ログイン</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </>
  );
};
export default Header;
