import Sketchboard from "@/components/Sketchboard";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <Sketchboard />
      <div className="bg-[#FFEDCF]  flex items-center justify-center">
        <h2 className="text-[#51252C] font-bold">
          <span>by </span>
          <Link
            href="https://www.malhar.fun/"
            target="_blank"
            className="hover:text-[#F16437] transition-all duration-400"
          >
            malhar.fun
          </Link>
        </h2>
      </div>
    </>
  );
}
