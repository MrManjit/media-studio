import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-10">

      <h1 className="text-5xl font-bold">
        📸 Media Studio
      </h1>

      <p className="mt-4 text-lg text-gray-600">
        Your private photo and video management platform.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

        <Link
          href="/library"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
            transition
          "
        >
          <h2 className="text-2xl font-bold">
            📁 Library
          </h2>

          <p className="mt-2">
            Browse all your photos and videos.
          </p>
        </Link>

        <Link
          href="/upload"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
            transition
          "
        >
          <h2 className="text-2xl font-bold">
            ⬆ Upload
          </h2>

          <p className="mt-2">
            Add new photos and videos.
          </p>
        </Link>

        <Link
          href="/albums"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
            transition
          "
        >
          <h2 className="text-2xl font-bold">
            📚 Albums
          </h2>

          <p className="mt-2">
            Organize media into albums.
          </p>
        </Link>

        <Link
          href="/favorites"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
            transition
          "
        >
          <h2 className="text-2xl font-bold">
            ❤️ Favorites
          </h2>

          <p className="mt-2">
            Quickly access your favorite media.
          </p>
        </Link>

        <Link
          href="/trash"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
            transition
          "
        >
          <h2 className="text-2xl font-bold">
            🗑 Trash
          </h2>

          <p className="mt-2">
            Restore or permanently remove media.
          </p>
        </Link>

      </div>

      <div className="mt-12 border rounded-xl p-6">

        <h3 className="text-xl font-bold">
          🚀 Current Features
        </h3>

        <ul className="mt-4 space-y-2">
          <li>✅ Upload Images & Videos</li>
          <li>✅ Gallery View</li>
          <li>✅ Full Screen Preview</li>
          <li>✅ Download Media</li>
          <li>✅ Search & Filters</li>
          <li>✅ Favorites</li>
          <li>✅ Trash & Restore System</li>
          <li>✅ Albums</li>
        </ul>

      </div>

    </main>
  );
}