
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUserByEmail } from "@/db/users/users.repo";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json(null, { status: 401 });
  }

  const user = await fetchUserByEmail(session.user.email);

  if (!user) {
    return Response.json(null, { status: 404 });
  }

  return Response.json(user);
}