// "use client";

// import { useState } from "react";

// export default function UploadPage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [message, setMessage] = useState("");

//   const uploadFile = async () => {
//     if (!file) {
//       setMessage("Please select a file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch(
//         "http://localhost:8000/api/media/upload/",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (response.ok) {
//         setMessage("Upload successful!");
//       } else {
//         setMessage("Upload failed");
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage("Server connection failed");
//     }
//   };

//   return (
//     <main className="min-h-screen p-10">
//       <h1 className="text-3xl font-bold mb-5">
//         Upload Media
//       </h1>

//       <input
//         type="file"
//         accept="image/*,video/*"
//         onChange={(e) =>
//           setFile(e.target.files?.[0] || null)
//         }
//         className="border p-2"
//       />

//       <br />

//       <button
//         onClick={uploadFile}
//         className="mt-4 bg-black text-white px-4 py-2 rounded"
//       >
//         Upload
//       </button>

//       {message && (
//         <p className="mt-4">
//           {message}
//         </p>
//       )}
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";


export default function UploadPage() {

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<any>(null);


  const uploadFile = async () => {

    if (!file) {
      setMessage("Please select a file");
      return;
    }


    setUploading(true);
    setMessage("");


    const formData = new FormData();
    formData.append("file", file);


    try {

      const response = await fetch(
        "http://localhost:8000/api/media/upload/",
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();


      if (response.ok) {

        setUploadedMedia(data);
        setMessage("Upload successful!");
        setFile(null);

      } else {

        setMessage("Upload failed");

      }

    } catch (error) {

      console.error(error);
      setMessage("Server connection failed");

    } finally {

      setUploading(false);

    }
  };


  return (
    <main className="min-h-screen p-10">

      <h1 className="text-4xl font-bold mb-8">
        Media Upload
      </h1>


      <div className="border rounded-lg p-6 max-w-xl">


        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            setUploadedMedia(null);
            setFile(e.target.files?.[0] || null);
          }}
        />


        {
          file &&
          <div className="mt-5">

            <h2 className="font-semibold">
              Selected File
            </h2>

            <p>
              Name: {file.name}
            </p>

            <p>
              Type: {file.type}
            </p>

            <p>
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>

          </div>
        }


        <button
          onClick={uploadFile}
          disabled={uploading}
          className="mt-5 bg-black text-white px-5 py-2 rounded disabled:opacity-50"
        >

          {
            uploading
            ? "Uploading..."
            : "Upload"
          }

        </button>


        {
          message &&
          <p className="mt-4">
            {message}
          </p>
        }


        {
          uploadedMedia &&
          <div className="mt-6 border-t pt-4">

            <h2 className="font-bold text-green-600">
              Upload Complete
            </h2>


            <p>
              File:
              {" "}
              {uploadedMedia.original_filename}
            </p>


            <p>
              Type:
              {" "}
              {uploadedMedia.media_type}
            </p>


            <p>
              Size:
              {" "}
              {(uploadedMedia.file_size / 1024).toFixed(2)}
              KB
            </p>


            <a
              href={uploadedMedia.file_url}
              target="_blank"
              className="text-blue-600 underline block mt-3"
            >
              Open File
            </a>


            <Link
              href="/library"
              className="text-blue-600 underline block mt-2"
            >
              Go To Library
            </Link>


          </div>
        }


      </div>

    </main>
  );

}