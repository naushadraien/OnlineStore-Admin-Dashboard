import { UserButton } from "@clerk/nextjs";

const SetupPage = () => {
  return (
    <div className="h-screen">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default SetupPage;
