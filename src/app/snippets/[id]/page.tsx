import SnippetDetails from "@/components/SnippetDetails";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { id } = params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=snippets/${id}`);

  return (
    <SnippetDetails
      snippetId={id}
      loggedInUserId={user.id}
    />
  );
};

export default Page;
