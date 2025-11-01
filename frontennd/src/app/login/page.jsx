import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form>
      <fieldset className="fieldset bg-base-200 border-base-300 w-full rounded-box border p-4">
        <legend className="fieldset-legend">ログイン</legend>
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
        <button className="btn btn-accent mt-4" formAction={login}>
          ログイン
        </button>
        <button className="btn btn-accent mt-4" formAction={signup}>
          サインアップ
        </button>
      </fieldset>
    </form>
  );
}
