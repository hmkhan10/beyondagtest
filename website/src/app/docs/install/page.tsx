import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Installation",
};

export default function InstallPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">Installation</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">npm (recommended)</h2>
        <p className="text-zinc-400 mb-4">
          Install globally with npm, then run the interactive onboarding wizard.
        </p>
        <pre>
          <code>{`npm install -g beyondagtest\nbeyondagtest onboard`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">curl (Linux / macOS)</h2>
        <p className="text-zinc-400 mb-4">
          One-line install that detects your platform and sets up the binary.
        </p>
        <pre>
          <code>{`curl -fsSL https://beyondagtest.dev/install.sh | bash`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Debian / Ubuntu (.deb)</h2>
        <pre>
          <code>{`sudo dpkg -i beyondagtest-latest.deb`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">AppImage (Linux)</h2>
        <pre>
          <code>{`chmod +x BeyondAgtest-*.AppImage && ./BeyondAgtest-*.AppImage`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Windows (.exe)</h2>
        <p className="text-zinc-400 mb-4">
          Download the latest <code>.exe</code> installer from the{" "}
          <a href="https://beyondagtest.dev/releases" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            releases page
          </a>{" "}
          and run it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">macOS (.dmg)</h2>
        <p className="text-zinc-400 mb-4">
          Download the <code>.dmg</code> from the{" "}
          <a href="https://beyondagtest.dev/releases" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            releases page
          </a>
          , mount, and drag BeyondAgtest to your Applications folder.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Verify installation</h2>
        <pre>
          <code>{`beyondagtest --version\n# beyondagtest v1.4.2`}</code>
        </pre>
      </section>
    </article>
  );
}
