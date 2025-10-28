import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <div className="drawer">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className="navbar bg-base-300 w-full">
              <div className="flex-none">
                <label
                  htmlFor="my-drawer-2"
                  aria-label="open sidebar"
                  className="btn btn-square btn-ghost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-6 w-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
              <div className="mx-2 flex-1 px-2">カス診断</div>
              <div className="hidden flex-none lg:block">
                <ul className="menu menu-horizontal">
                  <li>
                    <a>Navbar Item 1</a>
                  </li>
                  <li>
                    <a>Navbar Item 2</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full">
              <div className="max-w-screen-lg mx-auto p-8 shadow-md">
                {children}
              </div>
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 min-h-full w-80 p-4">
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  );
}
