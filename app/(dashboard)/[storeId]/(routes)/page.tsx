import prismadb from "@/lib/prismadb";

interface DahsboardPageProps {
  params: { storeId: string };
}
const DashboardPage: React.FC<DahsboardPageProps> = async ({ params }) => {
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
    },
  });
  return <div>Active Store: {store?.name}</div>;
};

export default DashboardPage;
