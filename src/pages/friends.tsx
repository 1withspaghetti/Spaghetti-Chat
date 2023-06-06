import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useContext } from "react";
import SkeletonText from "@/components/loader/SkeletonText";
import Layout from "@/components/Layout";

export default function Friends() {
    
  var authContext = useContext(AuthContext);
  const router = useRouter();

  return (
        <Layout>
            <div className="flex flex-col-reverse gap-4 md:flex-row px-4 py-2 md:py-4 h-screen overflow-y-auto">
                <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                    <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">All Friends</div>
                    <div className="flex flex-col w-full mt-2">
                        {[10, 17, 9, 12, 8, 15, 11, 13, 14, 17, 10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                            <div className="flex items-center gap-2 py-1 w-full" key={i}>
                                <div className="skeleton-pfp"></div>
                                <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                            </div>
                        )}
                    </div>
                </div>
                <div className="md:flex-1 flex flex-col gap-4 relative md:h-full">
                    <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                        <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Incoming Friend Requests</div>
                        <div className="flex flex-col w-full mt-2">
                            {[10, 17, 9, 12, 8].map((x, i) =>
                                <div className="flex items-center gap-2 py-1 w-full" key={i}>
                                    <div className="skeleton-pfp"></div>
                                    <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                        <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Outgoing Friend Requests</div>
                        <div className="flex flex-col w-full mt-2">
                            {[17, 10, 9,].map((x, i) =>
                                <div className="flex items-center gap-2 py-1 w-full" key={i}>
                                    <div className="skeleton-pfp"></div>
                                    <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
  )
}
