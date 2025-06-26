import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp appearance={{
        elements: {
          formButtonPrimary: "bg-indigo-500 hover:bg-indigo-600",
          card: "bg-slate-900/50 backdrop-blur-xl border border-slate-800",
          headerTitle: "text-slate-100",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "bg-slate-800 border border-slate-700 text-slate-100",
          formFieldLabel: "text-slate-300",
          formFieldInput: "bg-slate-800/50 border-slate-700 text-slate-100",
          footerActionLink: "text-indigo-500 hover:text-indigo-400",
        },
      }} />
    </div>
  );
} 