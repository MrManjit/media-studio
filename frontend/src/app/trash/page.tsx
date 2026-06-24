"use client";

import { useEffect, useState } from "react";


type Media = {
  id: string;
  original_filename: string;
  media_type: string;
  file_size: number;
  file_url: string;
  deleted_at: string;
};


export default function TrashPage() {

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchTrash();
  }, []);


  async function fetchTrash() {

    try {

      const response = await fetch(
        "http://localhost:8000/api/media/trash/"
      );

      const data = await response.json();

      setMedia(data);

    } catch(error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }


  async function restoreMedia(id: string) {

    const confirmed = window.confirm(
      "Restore this media?"
    );

    if (!confirmed) return;


    const response = await fetch(
      `http://localhost:8000/api/media/${id}/restore/`,
      {
        method: "POST",
      }
    );


    if (response.ok) {

      setMedia(
        media.filter(
          item => item.id !== id
        )
      );

    } else {

      alert("Failed to restore media");

    }

  }



  async function deleteForever(id: string) {

    const confirmed = window.confirm(
      "This will permanently delete the file. Continue?"
    );

    if (!confirmed) return;


    const response = await fetch(
      `http://localhost:8000/api/media/${id}/permanent/`,
      {
        method: "DELETE",
      }
    );


    if (response.ok) {

      setMedia(
        media.filter(
          item => item.id !== id
        )
      );

    } else {

      alert("Failed to delete media");

    }

  }


  if (loading) {

    return (
      <main className="p-8">
        Loading Trash...
      </main>
    );

  }


  return (

    <main className="p-8">


      <h1 className="text-4xl font-bold">
        Trash
      </h1>


      <p className="text-gray-500 mt-2">
        {media.length} items in trash
      </p>


      {
        media.length === 0
        ? (
          <p className="mt-8">
            Trash is empty 🎉
          </p>
        )

        : (

          <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            lg:grid-cols-4
            gap-6
            mt-8
          ">


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
                          opacity-60
                        "
                      />

                    )

                    : (

                      <div className="
                        h-56
                        flex
                        items-center
                        justify-center
                        text-6xl
                        opacity-60
                      ">
                        🎥
                      </div>

                    )

                  }


                  <div className="p-4">


                    <h2 className="font-bold truncate">
                      {item.original_filename}
                    </h2>


                    <p className="text-sm">
                      {(item.file_size / 1024).toFixed(2)} KB
                    </p>


                    <p className="text-sm text-gray-500">
                      Deleted:
                      {" "}
                      {
                        new Date(
                          item.deleted_at
                        ).toLocaleDateString()
                      }
                    </p>


                    <div className="
                      flex
                      gap-4
                      mt-4
                    ">


                      <button
                        onClick={() =>
                          restoreMedia(item.id)
                        }
                        className="
                          text-green-600
                          underline
                        "
                      >
                        Restore
                      </button>


                      <button
                        onClick={() =>
                          deleteForever(item.id)
                        }
                        className="
                          text-red-600
                          underline
                        "
                      >
                        Delete Forever
                      </button>


                    </div>


                  </div>


                </div>

              ))
            }


          </div>

        )
      }


    </main>

  );

}