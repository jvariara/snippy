import CreateSnippet from "@/components/CreateSnippet";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if(!user || !user.id) redirect("/auth-callback?origin=create-snippet")

  return (
    <div className="mx-auto max-w-7xl md:p-10">
      <CreateSnippet userId={user.id} />
    </div>
  );
};

export default Page;
