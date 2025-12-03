import { redirect } from "next/navigation";

export default function Home() {
  // Option 1: Redirect to login
  redirect("/login");

  // Option 2: Or create a landing page here if you prefer
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen">
  //     <h1 className="text-4xl font-bold mb-6">Welcome to LMS Platform</h1>
  //     <div className="flex gap-4">
  //       <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">Login</Link>
  //       <Link href="/register" className="px-4 py-2 bg-blue-500 text-white rounded">Register</Link>
  //     </div>
  //   </div>
  // );
}
