// import type { Metadata } from "next";
// import Link from "next/link";
// import "./globals.css";


// export const metadata: Metadata = {
//   title: "Media Studio",
//   description: "Private Photo & Video Manager",
// };


// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {

//   return (
//     <html lang="en">

//       <body>


//         <nav
//           className="
//             bg-black
//             text-white
//             px-8
//             py-4
//             flex
//             justify-between
//             items-center
//           "
//         >

//           <Link
//             href="/library"
//             className="
//               text-2xl
//               font-bold
//             "
//           >
//             Media Studio
//           </Link>


//           <div
//             className="
//               flex
//               gap-6
//               text-lg
//             "
//           >

//             <Link href="/library">
//               📁 Library
//             </Link>


//             <Link href="/upload">
//               ⬆ Upload
//             </Link>


//             <Link href="/trash">
//               🗑 Trash
//             </Link>

//           </div>


//         </nav>


//         {children}


//       </body>

//     </html>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";


export const metadata: Metadata = {
  title: "Media Studio",
  description: "Private Photo and Video Manager",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body>


        <nav
          className="
            bg-black
            text-white
            px-8
            py-4
            flex
            justify-between
            items-center
          "
        >

          {/* Logo */}
          <Link
            href="/"
            className="
              text-2xl
              font-bold
            "
          >
            📸 Media Studio
          </Link>


          {/* Navigation */}
          <div
            className="
              flex
              gap-6
              text-lg
            "
          >

            <Link
              href="/"
              className="hover:text-yellow-400"
            >
              🏠 Dashboard
            </Link>


            <Link
              href="/library"
              className="hover:text-yellow-400"
            >
              📁 Library
            </Link>


            <Link
              href="/favorites"
              className="hover:text-red-400"
            >
              ❤️ Favorites
            </Link>


            <Link
              href="/upload"
              className="hover:text-green-400"
            >
              ⬆ Upload
            </Link>


            <Link
              href="/trash"
              className="hover:text-orange-400"
            >
              🗑 Trash
            </Link>


          </div>


        </nav>


        <main>
          {children}
        </main>


      </body>

    </html>
  );
}