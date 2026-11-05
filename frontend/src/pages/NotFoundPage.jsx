import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Container } from "../components/ui";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-[75vh] place-items-center bg-loco-cream px-4 py-16">
      <Container className="max-w-lg text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-loco-wine shadow">
          <Compass size={38} />
        </span>
        <p className="mt-7 font-bold text-loco-orange">Page not found</p>
        <h1 className="mt-2 text-4xl font-black text-loco-wine">This road does not exist</h1>
        <p className="mt-4 leading-7 text-gray-600">The link may be old or mistyped. Head back to the marketplace or the jobs board.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/">Home</Button>
          <Button as={Link} to="/shop" variant="outline">Shop nearby</Button>
          <Button as={Link} to="/jobs" variant="outline">Jobs</Button>
        </div>
      </Container>
    </main>
  );
}
