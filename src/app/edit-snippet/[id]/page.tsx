import EditSnippet from "@/components/EditSnippet";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) redirect("/auth-callback?origin=dashboard");

  return (
    <div className="mx-auto max-w-7xl md:p-10">
      <EditSnippet loggedInUserId={user.id} snippetId={params.id} />
    </div>
  );
};

export default Page;
