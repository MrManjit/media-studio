// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-black text-white p-4">
//         <h1 className="text-2xl font-bold">
//           Media Studio
//         </h1>
//       </header>

//       {/* Hero Section */}
//       <section className="flex flex-col items-center justify-center h-[80vh]">
//         <h2 className="text-5xl font-bold mb-4">
//           Your Private AI Media Studio
//         </h2>

//         <p className="text-lg text-gray-600 mb-8">
//           Upload, organize, edit, and create amazing photos and videos.
//         </p>

//         <div className="flex gap-4">
//           <button className="bg-black text-white px-6 py-3 rounded-lg">
//             Open Library
//           </button>

//           <button className="border border-black px-6 py-3 rounded-lg">
//             Create Design
//           </button>
//         </div>
//       </section>
//     </main>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";


// type Media = {
//   id: string;
//   original_filename: string;
//   media_type: string;
//   file_size: number;
//   file_url: string;
//   created_at: string;
// };


// export default function LibraryPage() {

//   const [media, setMedia] = useState<Media[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [sort, setSort] = useState("newest");

//   const [selected, setSelected] = useState<Media | null>(null);


//   useEffect(() => {
//     fetchMedia();
//   }, []);


//   async function fetchMedia() {

//     try {

//       const response = await fetch(
//         "http://localhost:8000/api/media/"
//       );

//       const data = await response.json();

//       setMedia(data);

//     } catch (error) {

//       console.error(error);

//     } finally {

//       setLoading(false);

//     }

//   }


//   async function moveToTrash(id: string) {

//     const ok = window.confirm(
//       "Move this file to Trash?"
//     );

//     if (!ok) return;


//     const response = await fetch(
//       `http://localhost:8000/api/media/${id}/`,
//       {
//         method: "DELETE",
//       }
//     );


//     if (response.ok) {

//       setMedia(
//         media.filter(
//           item => item.id !== id
//         )
//       );


//       if (selected?.id === id) {
//         setSelected(null);
//       }

//     } else {

//       alert("Failed to move file to trash");

//     }

//   }


//   const filteredMedia = [...media]

//     .filter(item => {

//       const matchesSearch =
//         item.original_filename
//           .toLowerCase()
//           .includes(
//             search.toLowerCase()
//           );


//       const matchesFilter =
//         filter === "all"
//         || item.media_type === filter;


//       return (
//         matchesSearch &&
//         matchesFilter
//       );

//     })

//     .sort((a, b) => {

//       switch(sort) {

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


//         case "small":
//           return a.file_size - b.file_size;


//         case "large":
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
//       <main className="p-8">
//         Loading media...
//       </main>
//     );

//   }


//   return (

//     <main className="p-8">

//       <h1 className="text-4xl font-bold">
//         Media Library
//       </h1>


//       <p className="text-gray-500 mt-2">
//         {filteredMedia.length} items
//       </p>


//       <div className="mt-6 flex flex-wrap gap-3">


//         <input
//           type="text"
//           placeholder="Search files..."
//           value={search}
//           onChange={(e) =>
//             setSearch(e.target.value)
//           }
//           className="border p-2 rounded"
//         />


//         <select
//           value={filter}
//           onChange={(e) =>
//             setFilter(e.target.value)
//           }
//           className="border p-2 rounded"
//         >
//           <option value="all">
//             All
//           </option>

//           <option value="image">
//             Images
//           </option>

//           <option value="video">
//             Videos
//           </option>

//         </select>


//         <select
//           value={sort}
//           onChange={(e) =>
//             setSort(e.target.value)
//           }
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

//           <option value="small">
//             Smallest
//           </option>

//           <option value="large">
//             Largest
//           </option>

//         </select>


//       </div>



//       <div className="
//         grid
//         grid-cols-1
//         md:grid-cols-3
//         lg:grid-cols-4
//         gap-6
//         mt-8
//       ">


//         {
//           filteredMedia.map(item => (

//             <div
//               key={item.id}
//               className="
//                 border
//                 rounded-lg
//                 overflow-hidden
//                 shadow
//               "
//             >

//               <div
//                 className="cursor-pointer"
//                 onClick={() =>
//                   setSelected(item)
//                 }
//               >

//                 {
//                   item.media_type === "image"
//                   ? (
//                     <img
//                       src={item.file_url}
//                       className="
//                         w-full
//                         h-56
//                         object-cover
//                       "
//                     />
//                   )
//                   : (
//                     <div className="
//                       h-56
//                       flex
//                       items-center
//                       justify-center
//                       text-6xl
//                     ">
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
//                   {(item.file_size/1024).toFixed(2)}
//                   KB
//                 </p>


//                 <div className="
//                   flex
//                   gap-4
//                   mt-3
//                 ">


//                   <a
//                     href={item.file_url}
//                     download
//                     className="
//                       text-green-600
//                       underline
//                     "
//                   >
//                     Download
//                   </a>


//                   <button
//                     onClick={() =>
//                       moveToTrash(item.id)
//                     }
//                     className="
//                       text-red-600
//                       underline
//                     "
//                   >
//                     Trash
//                   </button>


//                 </div>


//               </div>


//             </div>

//           ))
//         }


//       </div>



//       {
//         selected && (

//           <div className="
//             fixed
//             inset-0
//             bg-black/90
//             flex
//             items-center
//             justify-center
//             z-50
//           ">


//             <div className="max-w-5xl">


//               <button
//                 className="
//                   text-white
//                   mb-4
//                 "
//                 onClick={() =>
//                   setSelected(null)
//                 }
//               >
//                 ✕ Close
//               </button>


//               {
//                 selected.media_type === "image"
//                 ? (

//                   <img
//                     src={selected.file_url}
//                     className="
//                       max-h-[80vh]
//                     "
//                   />

//                 )
//                 : (

//                   <video
//                     controls
//                     className="
//                       max-h-[80vh]
//                     "
//                   >

//                     <source
//                       src={selected.file_url}
//                     />

//                   </video>

//                 )
//               }


//             </div>


//           </div>

//         )
//       }


//     </main>

//   );

// }

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


      <div className="grid md:grid-cols-3 gap-6 mt-10">


        <Link
          href="/library"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
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
          href="/trash"
          className="
            border
            rounded-xl
            p-8
            shadow
            hover:shadow-lg
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
          <li>✅ Trash & Restore System</li>
        </ul>
      </div>


    </main>
  );
}