import { redirect } from "next/navigation";
import { WelcomeMail } from "@/components/welcome/WelcomeMail";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  for (const key of ["story", "category", "lat", "lng", "zoom"] as const) {
    const value = firstValue(params[key]);
    if (value) {
      next.set(key, value);
    }
  }

  if ([...next.keys()].length > 0) {
    redirect(`/explore?${next.toString()}`);
  }

  return <WelcomeMail />;
}
