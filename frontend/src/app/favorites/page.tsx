"use client";

import { useEffect, useState } from "react";


type Media = {
  id: string;
  original_filename: string;
  media_type: string;
  file_size: number;
  file_url: string;
};


export default function FavoritesPage() {

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<Media | null>(null);


  useEffect(() => {
    fetchFavorites();
  }, []);


  async function fetchFavorites() {

    try {

      const response = await fetch(
        "http://localhost:8000/api/media/favorites/"
      );

      const data = await response.json();

      setMedia(data);

    } catch(error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }



  async function removeFavorite(id: string) {


    const response = await fetch(
      `http://localhost:8000/api/media/${id}/favorite/`,
      {
        method: "POST",
      }
    );


    if(response.ok) {

      setMedia(
        media.filter(
          item => item.id !== id
        )
      );

    } else {

      alert("Unable to remove favorite");

    }

  }



  if(loading) {

    return (
      <main className="p-8">
        Loading favorites...
      </main>
    );

  }


  return (

    <main className="p-8">


      <h1 className="text-4xl font-bold">
        ❤️ Favorites
      </h1>


      <p className="text-gray-500 mt-2">
        {media.length} favorite items
      </p>


      {
        media.length === 0

        ? (

          <p className="mt-8">
            No favorite media yet.
          </p>

        )

        : (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
              mt-8
            "
          >


            {
              media.map(item => (

                <div
                  key={item.id}
                  className="
                    border
                    rounded-lg
                    overflow-hidden
                    shadow
                  "
                >


                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setSelected(item)
                    }
                  >

                    {
                      item.media_type === "image"

                      ? (

                        <img
                          src={item.file_url}
                          alt={item.original_filename}
                          className="
                            w-full
                            h-56
                            object-cover
                          "
                        />

                      )

                      : (

                        <div
                          className="
                            h-56
                            flex
                            items-center
                            justify-center
                            text-6xl
                          "
                        >
                          🎥
                        </div>

                      )

                    }


                  </div>


                  <div className="p-4">


                    <h2 className="font-bold truncate">
                      {item.original_filename}
                    </h2>


                    <p className="text-sm text-gray-500">
                      {(item.file_size / 1024).toFixed(2)}
                      {" "}
                      KB
                    </p>


                    <div
                      className="
                        flex
                        gap-4
                        mt-4
                      "
                    >


                      <button
                        onClick={() =>
                          removeFavorite(item.id)
                        }
                        className="
                          text-red-600
                        "
                      >
                        ❤️ Remove
                      </button>


                      <a
                        href={item.file_url}
                        download
                        className="
                          text-green-600
                          underline
                        "
                      >
                        Download
                      </a>


                    </div>


                  </div>


                </div>

              ))
            }


          </div>

        )
      }


      {
        selected && (

          <div
            className="
              fixed
              inset-0
              bg-black/90
              flex
              justify-center
              items-center
              z-50
            "
          >


            <div>


              <button
                className="
                  text-white
                  mb-4
                "
                onClick={() =>
                  setSelected(null)
                }
              >
                ✕ Close
              </button>


              {
                selected.media_type === "image"

                ? (

                  <img
                    src={selected.file_url}
                    alt={selected.original_filename}
                    className="
                      max-h-[80vh]
                    "
                  />

                )

                : (

                  <video
                    controls
                    className="
                      max-h-[80vh]
                    "
                  >

                    <source
                      src={selected.file_url}
                    />

                  </video>

                )

              }


            </div>


          </div>

        )

      }


    </main>

  );

}