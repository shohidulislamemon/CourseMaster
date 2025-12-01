import { SignIn } from "@clerk/nextjs";

const SignInPage = ({ searchParams }: { searchParams?: { redirect_url?: string } }) => {
  const redirectUrl = searchParams?.redirect_url || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
            card:'shadow-xl'
          },
        }}
        signUpUrl="/sign-up"
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
};

export default SignInPage;
