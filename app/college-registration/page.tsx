import CollegeRegistrationForm from "@/components/CollegeRegistrationForm";
import RegistrationAuth from "@/components/auth/RegistrationAuth";

export default function CollegeRegistrationPage() {
  return (
    <div className="min-h-screen w-full bg-background py-12 px-4">
      <RegistrationAuth
        className="mx-auto w-full max-w-5xl"
        unauthenticatedClassName="mx-auto"
        callbackUrl="/college-registration"
        title="Continue college registration"
        subtitle="Use LinkedIn to sign in or sign up and we will auto-fill your details"
        hideCredentials
      >
        <CollegeRegistrationForm />
      </RegistrationAuth>
    </div>
  );
}
