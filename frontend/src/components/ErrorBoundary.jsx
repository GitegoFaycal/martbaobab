import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-baobab-cream px-4">
        <div className="max-w-lg text-center">
          <p className="font-bold text-baobab-orange">Something went wrong</p>

          <h1 className="mt-2 text-3xl font-black text-baobab-wine">
            This page could not be displayed
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            An unexpected error occurred. Reload the page or return to the
            homepage.
          </p>

          <a
            href="/"
            className="mt-7 inline-block rounded-full bg-baobab-wine px-7 py-3 font-bold text-white"
          >
            Return home
          </a>
        </div>
      </main>
    );
  }
}
