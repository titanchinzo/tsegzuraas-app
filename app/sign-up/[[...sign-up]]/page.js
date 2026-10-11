import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center">
      <SignUp path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
