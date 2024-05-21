import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import UserAccountNav from "./UserAccountNav";
import { ArrowRight } from "lucide-react";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import MobileNav from "./MobileNav";
import { ThemeSwitch } from "./theme/theme-switcher";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <div className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 dark:bg-black dark:border-black backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-gray-900">
          {/* Logo */}
          <Link
            href="/"
            className="inset-y-0 z-40 flex items-center font-semibold"
          >
            ✂ Snippy
          </Link>

          {/* TODO: MobileNav */}
          <MobileNav isAuth={!!user} />

          

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <LoginLink
                  postLoginRedirectURL="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink
                  postLoginRedirectURL="/dashboard"
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Get started <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/snippets"
                >
                  Snippets
                </Link>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
            <ThemeSwitch />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default Navbar;
