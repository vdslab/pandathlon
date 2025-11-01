import Link from "next/link";
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <form>
      <fieldset className="fieldset bg-base-200 border-base-300 w-full rounded-box border p-4">
        <legend className="fieldset-legend">サインアップ</legend>
        <label htmlFor="name" className="label">
          ニックネーム
        </label>
        <input id="name" name="name" type="text" className="input w-full" />
        <label htmlFor="email" className="label">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input w-full"
          required
        />
        <label htmlFor="password" className="label">
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input w-full"
          required
        />
        <button className="btn btn-accent mt-4 w-full" formAction={signup}>
          サインアップ
        </button>
        <div className="divider">または</div>
        <Link href="/login" className="btn btn-ghost w-full">
          アカウントをお持ちの方はログイン
        </Link>
      </fieldset>
    </form>
  );
}
