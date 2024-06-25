import SecretPage from "@/components/pages/Secret";
import { getMnemonic } from "@/server/actions/auth/login.action";

export default async function Page() {
    const secret = await getMnemonic();
    const secretKey = secret.secretKey ? secret.secretKey : secret.error;

    return <SecretPage secret={secretKey} />;
}
