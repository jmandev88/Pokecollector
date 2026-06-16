import Header from "@/app/components/layout/Header/Header";

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          This should be the EN homepage - currently hardcoded
      </div>
    </div>
  );
}
