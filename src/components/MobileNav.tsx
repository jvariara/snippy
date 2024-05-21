"use client";

import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeSwitch } from "./theme/theme-switcher";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden flex items-center gap-x-4">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700 dark:text-zinc-100 cursor-pointer"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 slide-out-to-top-5 inset-0 z-0 w-full">
          <ul className="absolute bg-white dark:bg-black border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-up")}
                    href="/sign-up"
                    className="flex items-center w-full font-semibold text-primary"
                  >
                    Get started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </li>

                <li className="my-3 h-px w-full bg-gray-300" />

                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-in")}
                    href="/sign-in"
                    className="flex items-center w-full font-semibold"
                  >
                    Sign in
                  </Link>
                </li>

                <li className="my-3 h-px w-full bg-gray-300" />
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    href="/dashboard"
                    className="flex items-center w-full font-semibold"
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="my-3 h-px w-full bg-gray-300" />

                <li>
                  <Link
                    onClick={() => closeOnCurrent("/snippets")}
                    href="/snippets"
                    className="flex items-center w-full font-semibold"
                  >
                    Snippets
                  </Link>
                </li>

                <li className="my-3 h-px w-full bg-gray-300" />

                <li>
                  <Link
                    href="/sign-out"
                    className="flex items-center w-full font-semibold"
                  >
                    Sign out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
      <ThemeSwitch />
    </div>
  );
};

export default MobileNav;
