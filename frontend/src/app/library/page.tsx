// "use client";

// import { useEffect, useState } from "react";

// type Media = {
//   id: string;
//   original_filename: string;
//   media_type: string;
//   mime_type: string;
//   file_size: number;
//   file_url: string;
//   created_at: string;
// };

// export default function LibraryPage() {
//   const [mediaList, setMediaList] = useState<Media[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [sortBy, setSortBy] = useState("newest");

//   const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);


//   useEffect(() => {
//     fetchMedia();
//   }, []);


//   const fetchMedia = async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:8000/api/media/"
//       );

//       const data = await response.json();

//       setMediaList(data);

//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const deleteMedia = async (id: string) => {

//     const confirmDelete = window.confirm(
//       "Delete this media permanently?"
//     );

//     if (!confirmDelete) return;


//     try {

//       const response = await fetch(
//         `http://localhost:8000/api/media/${id}/`,
//         {
//           method: "DELETE",
//         }
//       );


//       if (response.ok) {

//         setMediaList(
//           mediaList.filter(
//             (item) => item.id !== id
//           )
//         );

//         if (selectedMedia?.id === id) {
//           setSelectedMedia(null);
//         }

//       } else {

//         alert("Unable to delete file");

//       }

//     } catch (error) {

//       console.error(error);
//       alert("Server error");

//     }
//   };


//   const processedMedia = [...mediaList]

//     .filter((item) => {

//       const matchesSearch =
//         item.original_filename
//           .toLowerCase()
//           .includes(search.toLowerCase());


//       const matchesFilter =
//         filter === "all" ||
//         item.media_type === filter;


//       return matchesSearch && matchesFilter;

//     })


//     .sort((a, b) => {

//       switch (sortBy) {

//         case "oldest":
//           return (
//             new Date(a.created_at).getTime()
//             -
//             new Date(b.created_at).getTime()
//           );


//         case "name":
//           return a.original_filename.localeCompare(
//             b.original_filename
//           );


//         case "smallest":
//           return a.file_size - b.file_size;


//         case "largest":
//           return b.file_size - a.file_size;


//         default:
//           return (
//             new Date(b.created_at).getTime()
//             -
//             new Date(a.created_at).getTime()
//           );

//       }

//     });


//   if (loading) {
//     return (
//       <main className="p-10">
//         Loading Media...
//       </main>
//     );
//   }


//   return (
//     <main className="min-h-screen p-8">


//       <h1 className="text-4xl font-bold">
//         Media Studio Library
//       </h1>


//       <p className="mt-2 text-gray-500">
//         {processedMedia.length} items
//       </p>


//       <input
//         type="text"
//         placeholder="Search media..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="
//           mt-6
//           border
//           p-3
//           rounded
//           w-full
//           max-w-md
//         "
//       />


//       <div className="flex gap-3 mt-4 flex-wrap">


//         <button onClick={() => setFilter("all")}
//           className="border px-4 py-2 rounded">
//           All
//         </button>


//         <button onClick={() => setFilter("image")}
//           className="border px-4 py-2 rounded">
//           🖼 Images
//         </button>


//         <button onClick={() => setFilter("video")}
//           className="border px-4 py-2 rounded">
//           🎥 Videos
//         </button>


//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="newest">
//             Newest
//           </option>

//           <option value="oldest">
//             Oldest
//           </option>

//           <option value="name">
//             Name A-Z
//           </option>

//           <option value="smallest">
//             Size ↑
//           </option>

//           <option value="largest">
//             Size ↓
//           </option>

//         </select>

//       </div>



//       <div className="
//         grid
//         grid-cols-1
//         md:grid-cols-3
//         lg:grid-cols-4
//         gap-6
//         mt-8">

//         {
//           processedMedia.map((item) => (

//             <div
//               key={item.id}
//               className="
//                 border
//                 rounded-lg
//                 overflow-hidden
//                 shadow
//                 hover:shadow-xl
//                 transition
//               ">

//               <div
//                 className="cursor-pointer"
//                 onClick={() => setSelectedMedia(item)}
//               >

//                 {
//                   item.media_type === "image" ? (

//                     <img
//                       src={item.file_url}
//                       alt={item.original_filename}
//                       className="
//                         w-full
//                         h-56
//                         object-cover
//                       "
//                     />

//                   ) : (

//                     <div className="
//                       h-56
//                       flex
//                       items-center
//                       justify-center
//                       text-6xl">
//                       🎥
//                     </div>

//                   )
//                 }

//               </div>


//               <div className="p-4">

//                 <h2 className="font-bold truncate">
//                   {item.original_filename}
//                 </h2>


//                 <p>
//                   {(item.file_size / 1024).toFixed(2)} KB
//                 </p>


//                 <div className="flex gap-4 mt-3">

//                   <a
//                     href={item.file_url}
//                     download
//                     className="text-green-600 underline"
//                   >
//                     Download
//                   </a>


//                   <button
//                     onClick={() => deleteMedia(item.id)}
//                     className="text-red-600 underline"
//                   >
//                     Delete
//                   </button>


//                 </div>

//               </div>

//             </div>

//           ))
//         }

//       </div>



//       {
//         selectedMedia && (

//           <div className="
//             fixed inset-0
//             bg-black/90
//             flex
//             items-center
//             justify-center
//             z-50
//           ">

//             <div className="max-w-5xl p-4">


//               <button
//                 onClick={() => setSelectedMedia(null)}
//                 className="
//                   text-white
//                   text-xl
//                   mb-4
//                 ">
//                 ✕ Close
//               </button>


//               {
//                 selectedMedia.media_type === "image"
//                 ? (

//                   <img
//                     src={selectedMedia.file_url}
//                     alt=""
//                     className="
//                       max-h-[80vh]
//                       rounded
//                     "
//                   />

//                 ) : (

//                   <video
//                     controls
//                     className="
//                       max-h-[80vh]
//                     "
//                   >

//                     <source
//                       src={selectedMedia.file_url}
//                     />

//                   </video>

//                 )
//               }


//               <div className="
//                 text-white
//                 mt-4
//               ">

//                 <h2 className="text-xl font-bold">
//                   {selectedMedia.original_filename}
//                 </h2>

//                 <p>
//                   {(selectedMedia.file_size / 1024).toFixed(2)}
//                   KB
//                 </p>

//               </div>

//             </div>

//           </div>

//         )
//       }


//     </main>
//   );

// }

"use client";

import { useEffect, useState } from "react";


type Media = {
  id: string;
  original_filename: string;
  media_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
  is_favorite: boolean;
};


export default function LibraryPage() {


  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [selected, setSelected] =
    useState<Media | null>(null);



  useEffect(() => {
    fetchMedia();
  }, []);



  async function fetchMedia() {

    try {

      const response = await fetch(
        "http://localhost:8000/api/media/"
      );

      const data = await response.json();

      setMedia(data);

    } catch(error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }



  async function toggleFavorite(id: string) {


    try {

      const response = await fetch(
        `http://localhost:8000/api/media/${id}/favorite/`,
        {
          method: "POST",
        }
      );


      if(response.ok) {


        const result = await response.json();


        setMedia(
          media.map(item => {

            if(item.id === id) {

              return {
                ...item,
                is_favorite: result.is_favorite,
              };

            }

            return item;

          })
        );


      } else {

        alert("Failed to update favorite");

      }


    } catch(error) {

      console.error(error);

    }

  }

  async function moveToTrash(id: string) {


    const confirmDelete = window.confirm(
      "Move this file to Trash?"
    );


    if(!confirmDelete) {
      return;
    }


    const response = await fetch(
      `http://localhost:8000/api/media/${id}/`,
      {
        method: "DELETE",
      }
    );


    if(response.ok) {


      setMedia(
        media.filter(
          item => item.id !== id
        )
      );


      if(selected?.id === id) {

        setSelected(null);

      }


    } else {

      alert("Failed to move to trash");

    }


  }




  const filteredMedia = [...media]


    .filter(item => {


      const matchSearch =
        item.original_filename
        .toLowerCase()
        .includes(search.toLowerCase());


      const matchFilter =
        filter === "all"
        ||
        item.media_type === filter;


      return (
        matchSearch &&
        matchFilter
      );


    })


    .sort((a, b) => {


      switch(sort) {


        case "oldest":

          return (
            new Date(a.created_at).getTime()
            -
            new Date(b.created_at).getTime()
          );


        case "name":

          return a.original_filename.localeCompare(
            b.original_filename
          );


        case "small":

          return (
            a.file_size - b.file_size
          );


        case "large":

          return (
            b.file_size - a.file_size
          );


        default:

          return (
            new Date(b.created_at).getTime()
            -
            new Date(a.created_at).getTime()
          );

      }


    });



  if(loading) {

    return (
      <main className="p-8">
        Loading media...
      </main>
    );

  }


  return (

    <main className="p-8">


      <h1 className="text-4xl font-bold">
        📁 Media Library
      </h1>


      <p className="text-gray-500 mt-2">
        {filteredMedia.length} items
      </p>


      <div className="mt-6 flex flex-wrap gap-3">


        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border p-2 rounded"
        />


        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="all">
            All
          </option>

          <option value="image">
            Images
          </option>

          <option value="video">
            Videos
          </option>

        </select>        
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
          className="border p-2 rounded"
        >

          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="name">
            Name A-Z
          </option>

          <option value="small">
            Smallest
          </option>

          <option value="large">
            Largest
          </option>

        </select>


      </div>


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
          filteredMedia.map(item => (

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
                      toggleFavorite(item.id)
                    }
                    className="
                      text-red-500
                    "
                  >
                    {
                      item.is_favorite
                        ? "❤️"
                        : "🤍"
                    }
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


                  <button
                    onClick={() =>
                      moveToTrash(item.id)
                    }
                    className="
                      text-red-700
                      underline
                    "
                  >
                    Trash
                  </button>


                </div>


              </div>


            </div>

          ))
        }


      </div>


      {
        selected && (

          <div
            className="
              fixed
              inset-0
              bg-black/90
              flex
              items-center
              justify-center
              z-50
            "
          >


            <div
              className="max-w-5xl"
            >


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