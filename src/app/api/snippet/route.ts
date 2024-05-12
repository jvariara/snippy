import { db } from "@/db";
import { SnippetValidation } from "@/lib/validations/snippet";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  // endpoint for creating a snippet
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) return new Response("Unauthorized", { status: 401 });

  const { code, language, name } = SnippetValidation.parse(body);

  const snippet = await db.snippet.create({
    data: {
      code,
      language,
      userId: user.id,
      name
    },
  });

  return { success: true, snippet };
};
