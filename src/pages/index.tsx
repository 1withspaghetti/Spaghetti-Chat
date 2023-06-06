import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useContext } from "react";
import ThemeSwitch from "@/components/ThemeSwitch";
import MessageInput from "@/components/MessageInput";
import SkeletonText from "@/components/loader/SkeletonText";
import Layout from "@/components/Layout";

export default function Home() {

  var authContext = useContext(AuthContext);
  const router = useRouter();

  return (
        <Layout>
            <div className="flex flex-col w-full pt-2 pr-2">
                <div className="absolute flex z-10 top-2 left-2 right-2 ml-2 mr-5 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                    <SkeletonText className="text-xl font-bold mr-2" width={200}></SkeletonText>
                    <SkeletonText className="text-lg" faint width={400}></SkeletonText>
                </div>
                <div className="flex flex-col-reverse gap-2 h-full px-4 pt-16 pb-4 overflow-y-auto">
                    { true ?
                        <>
                            {[10, 17, 9, 12, 8, 15, 11, 13, 14, 17,  10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                                <div className="flex mx-2 py-1" key={i}>
                                    <div className="skeleton-pfp mr-2"></div>
                                    <div className="w-full">
                                        <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                        <SkeletonText className="text-lg font-bold" width={x*30} faint></SkeletonText>
                                    </div>
                                </div>
                            )}
                        </>
                    :
                        <>

                        </>
                    }
                </div>
                <MessageInput />
                <div className="absolute top-16 right-12"><ThemeSwitch></ThemeSwitch></div>
            </div>
        </Layout>
  )
}
