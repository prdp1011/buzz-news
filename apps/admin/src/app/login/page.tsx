import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-zinc-400 text-sm">
          Sign in to manage QuizLab content
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
