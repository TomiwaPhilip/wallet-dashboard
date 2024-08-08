import HomePage from "@/components/pages/Home";
import getSession from "@/server/actions/server-hooks/getsession.action";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await getSession();
  console.log(session);

  if(session.isSecretCopied != true) {
    redirect("/auth/secret")
  }
  
  return (
    <main className="">
      <HomePage />
    </main>
  );
}
