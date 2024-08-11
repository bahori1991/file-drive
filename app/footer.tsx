import Link from "next/link";

export function Footer() {
  return (
    <div className="h-40 bg-gray-100 mt-12 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <div>FileDrive</div>
        <Link className="text-blue-400 hover:text-blue-500" href="/privacy">
          プライバシーポリシー
        </Link>
        <Link className="text-blue-400 hover:text-blue-500" href="/terms">
          利用規約
        </Link>
        <Link className="text-blue-400 hover:text-blue-500" href="/about">
          FileDriveについて
        </Link>
      </div>
    </div>
  );
}
