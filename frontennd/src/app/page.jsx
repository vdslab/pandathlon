import Link from "next/link";

export default function RootPage() {
  return (
    <>
      <Link className="btn" href="/mypage/quizzes/new">
        診断を作る
      </Link>
    </>
  );
}
