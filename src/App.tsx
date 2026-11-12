import Gallery from "./Gallery";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("gallery")) return <Gallery only={params.get("gallery") || undefined} />;
  return (
    <main style={{ fontFamily: "Oswald, sans-serif", padding: 24 }}>
      <h1>Nemesis Datacard Maker</h1>
      <p>Coming soon. Fan-made, not affiliated with Games Workshop.</p>
    </main>
  );
}
