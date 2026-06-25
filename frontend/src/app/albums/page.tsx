"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Album = {
  id: string;
  name: string;
  description: string;
  media_count: number;
};

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    try {
      const response = await fetch(
        "http://localhost:8000/api/media/albums/"
      );

      const data = await response.json();

      setAlbums(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function createAlbum() {
    if (!name.trim()) {
      alert("Album name is required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/media/albums/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      if (response.ok) {
        setName("");
        setDescription("");

        fetchAlbums();
      } else {
        alert("Failed to create album");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold">
        📁 Albums
      </h1>

      <p className="text-gray-500 mt-2">
        Organize your photos and videos into albums.
      </p>

      {/* Create Album */}

      <div className="mt-8 border rounded-lg p-6">

        <h2 className="text-xl font-bold mb-4">
          Create Album
        </h2>

        <input
          type="text"
          placeholder="Album name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="
            border
            p-2
            rounded
            w-full
            mb-3
          "
        />

        <textarea
          placeholder="Album description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="
            border
            p-2
            rounded
            w-full
            mb-3
          "
          rows={3}
        />

        <button
          onClick={createAlbum}
          className="
            bg-blue-600
            text-white
            px-4
            py-2
            rounded
            hover:bg-blue-700
          "
        >
          Create Album
        </button>

      </div>

      {/* Albums Grid */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Your Albums
        </h2>

        {albums.length === 0 ? (
          <p className="text-gray-500">
            No albums created yet.
          </p>
        ) : (
          <div
            className="
              grid
              md:grid-cols-3
              gap-6
            "
          >

            {albums.map((album) => (

              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="
                  border
                  rounded-xl
                  p-5
                  shadow-sm
                  hover:shadow-lg
                  hover:bg-gray-50
                  transition
                  block
                "
              >

                <h3 className="text-xl font-bold">
                  📁 {album.name}
                </h3>

                <p className="text-gray-500 mt-2">
                  {album.description ||
                    "No description"}
                </p>

                <p className="mt-3 font-medium">
                  {album.media_count} items
                </p>

                <p className="mt-4 text-blue-600">
                  Open Album →
                </p>

              </Link>

            ))}

          </div>
        )}

      </div>

    </main>
  );
}