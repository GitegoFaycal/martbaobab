import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Container } from "../components/ui";
import { useT } from "../i18n";

export default function NotFoundPage() {
  const t = useT();

  return (
    <main className="grid min-h-[75vh] place-items-center bg-loco-ice px-4 py-16">
      <Container className="max-w-lg text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-loco-navy shadow"><Compass size={38} /></span>
        <p className="mt-7 font-bold text-loco-blue">{t("common.notFound")}</p>
        <h1 className="mt-2 text-4xl font-black text-loco-navy">{t("common.notFoundTitle")}</h1>
        <p className="mt-4 leading-7 text-gray-600">{t("common.notFoundText")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/">{t("common.home")}</Button>
          <Button as={Link} to="/shop" variant="outline">{t("nav.shop")}</Button>
          <Button as={Link} to="/jobs" variant="outline">{t("nav.jobs")}</Button>
        </div>
      </Container>
    </main>
  );
}
