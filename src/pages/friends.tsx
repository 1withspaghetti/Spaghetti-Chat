import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import SkeletonText from "@/components/loader/SkeletonText";
import FormInput from "@/components/FormInput";
import axios from "axios";
import User from "@/components/User";
import SkeletonProfile from "@/components/loader/SkeletonProfile";
import { NextPageWithLayout } from "./_app";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SocketContext } from "@/context/SocketContext";
import { globalReducer } from "@/utils/reducer";

const Friends: NextPageWithLayout = () => {
    
    var authContext = useContext(AuthContext);
    var socket = useContext(SocketContext);
    const router = useRouter();

    const [friendsLoaded, setFriendsLoaded] = useState<boolean>(false);

    const [incoming, dispatchIncoming] = useReducer(globalReducer, []);
    const [outgoing, dispatchOutgoing] = useReducer(globalReducer, []);
    const [friends, dispatchFriends] = useReducer(globalReducer, []);
    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || friendsLoaded) return;

        axios.get('/api/user/friends', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setFriendsLoaded(true);
            dispatchIncoming({action: 'set', data: res.data.incoming});
            dispatchOutgoing({action: 'set', data: res.data.outgoing});
            dispatchFriends({action: 'set', data: res.data.friends});
        })
    }, [authContext.awaitAuth]);

    // Handle updates sent from server via WebSocket
    useEffect(()=>{
        if (!socket) return;
        socket.on('friendUpdate', onUpdate);
        return ()=>{
            socket?.off('friendUpdate', onUpdate);
        }
    }, [socket]);
    function onUpdate(data: any) {
        if (data.incoming) dispatchIncoming(data.incoming);
        if (data.outgoing) dispatchOutgoing(data.outgoing);
        if (data.friends) dispatchFriends(data.friends);
    }

    const searchElement = useRef<FormInput>(null);
    const [searchResults, setSearchResults] = useState<Array<any>>([]);
    const [searchTab, setSearchTab] = useState<number>(-1);

    let debounceTimer: number|undefined = undefined;
    function updateSearchDebounce() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateSearch, 250) as any;
    }
    function updateSearch() {
        var q = searchElement.current?.getValue().replaceAll(/[^\w]/g, '');
        if (!q) return setSearchResults([]);
        axios.get("/api/user/search", {params: {q}, headers: {Authorization: authContext.resourceToken}}).then(res => {
            setSearchResults(res.data.results);
            setSearchTab(-1);
        }).catch(() => {
            console.error("Failed to search users");
        });
    }
    function searchNavigation(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key == "ArrowDown" || (event.key == "Tab" && !event.shiftKey)) {
            event.preventDefault();
            setSearchTab((searchTab+1)%searchResults.length);
        } else if (event.key == "ArrowUp") {
            event.preventDefault();
            setSearchTab((searchTab-1+searchResults.length)%searchResults.length);
        } else if (event.key == "Enter" && searchTab != -1) {
            event.preventDefault();
            addFriend(searchResults[searchTab]);
        }
    }

    function addFriend(user: any) {
        axios.post("/api/user/friends", {to: user.id}, {headers: {Authorization: authContext.resourceToken}}).catch(()=>{
            console.error("Failed to add friend");
        });
        searchElement.current?.setValue("");
        setSearchResults([]);
        setSearchTab(-1);
    }

    function acceptFriend(user: any) {
        dispatchIncoming({action: 'delete', data: user});
        axios.post("/api/user/friends?acceptOnly=true", {to: user.id}, {headers: {Authorization: authContext.resourceToken}}).catch(() => {
            console.error("Failed to accept friend");
        });
    }



    const [pendingRemoval, setPendingRemoval] = useState<any>();

    function removeFriend(user: any) {
        dispatchIncoming({action: 'delete', data: user});
        dispatchOutgoing({action: 'delete', data: user});
        dispatchFriends({action: 'delete', data: user});
        setPendingRemoval(undefined);
        axios.delete(`/api/user/friends?user=${user.id}`, {headers: {Authorization: authContext.resourceToken}}).catch(() => {
            console.error("Failed to remove friend");
        });
    }

    return (
        <>
            <div className="w-full flex flex-col px-4 items-center mt-4 mb-4 pr-6">
                <div className="w-full max-w-lg px-4 py-1 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Add Friends</div>
                <div className="relative w-full max-w-sm">
                    <FormInput ref={searchElement} id="search" label="" attr={{placeholder: "Search Users", onChange: updateSearchDebounce, autoComplete: 'off', onKeyDown: searchNavigation}} width={384}></FormInput>
                    {searchResults.length > 0 && 
                    <div className="absolute z-20 w-full flex flex-col gap-2 gradient bg-opacity-100 shadow-lg rounded-lg">
                        {searchResults.map((x, i) => 
                            <div className={`bg-black bg-opacity-0 hover:bg-opacity-10 transition-colors ${searchTab != i ? 'bg-opacity-0' : 'bg-opacity-10'}`} key={x.id} onClick={()=>{addFriend(x)}}>
                                <User {...x}></User>
                            </div>
                        )}
                    </div>}
                </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row px-4 py-2 md:py-4 h-screen overflow-y-auto">
                <div className="md:flex-1 flex flex-col gap-4 relative md:h-full">
                    <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                        <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Incoming Friend Requests</div>
                        <div className="flex flex-col w-full mt-2">
                            {!friendsLoaded ? 
                                <div className="italic font-bold text-center opacity-50">Loading...</div> 
                                :
                                (incoming.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Incoming Friend Requests</div> 
                                : incoming.sort((a, b) => a.username.localeCompare(b.username)).map((x, i) => 
                                    <User {...x} key={i}>
                                        <button className="text-2xl px-1 text-green-500 opacity-50 hover:opacity-75 transition-opacity" title="Accept Friend Request" onClick={()=>{acceptFriend(x)}}>✔</button>
                                        <button className="text-4xl px-1 text-red-500 opacity-50 hover:opacity-75 transition-opacity" title="Deny Friend Request" onClick={()=>{removeFriend(x)}}>⨯</button>
                                    </User>
                                ))
                            }
                        </div>
                    </div>
                    <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                        <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Outgoing Friend Requests</div>
                        <div className="flex flex-col w-full mt-2">
                            {!friendsLoaded ? 
                                <div className="italic font-bold text-center opacity-50">Loading...</div> 
                                :
                                (outgoing.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Outgoing Friend Requests</div> 
                                : outgoing.sort((a, b) => a.username.localeCompare(b.username)).map((x, i) => 
                                    <User {...x} key={i}>
                                        <button className="text-4xl px-2 text-red-500 opacity-50 hover:opacity-75 transition-opacity" title="Cancel Pending Request" onClick={()=>{removeFriend(x)}}>⨯</button>
                                    </User>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                    <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">All Friends</div>
                    <div className="flex flex-col w-full mt-2">
                        {!friendsLoaded ? 
                                [10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                                    <div className="flex items-center gap-2 py-1 w-full" key={i}>
                                        <SkeletonProfile/>
                                        <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                    </div>
                                )
                                :
                                (friends.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Friends :(</div> 
                                : friends.sort((a, b) => a.username.localeCompare(b.username)).map((x, i) => 
                                    <User {...x} key={i}>
                                        <button className="text-4xl px-2 text-red-500 opacity-50 hover:opacity-75 transition-opacity" title="Remove Friend" onClick={()=>{setPendingRemoval(x)}}>⨯</button>
                                    </User>
                                ))
                            }
                    </div>
                </div>
            </div>
            {pendingRemoval && 
                <div className="fixed z-50 top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50" onClick={(e)=>setPendingRemoval(undefined)}>
                    <div className="flex flex-col items-center gradient bg-opacity-60 p-6 m-4 rounded-lg shadow-lg text-center" onClick={e=>e.stopPropagation()}>
                        <div className="text-xl mb-4 font-semibold">Are you sure you would like to un-friend the following user?</div>
                        <div className="px-2 py-1 bg-black bg-opacity-25 rounded-lg shadow">
                            <User {...pendingRemoval}></User>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button className="px-4 py-1 bg-slate-800 text-lg font-bold rounded-lg shadow hover:scale-105 transition-transform" onClick={()=>setPendingRemoval(undefined)}>Cancel</button>
                            <button className="px-4 py-1 bg-red-600 text-lg font-bold rounded-lg shadow hover:scale-105 transition-transform" onClick={()=>{removeFriend(pendingRemoval)}}>Remove</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
Friends.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Friends;

export function getStaticProps() {
    return {props: {title: "Friends"}}
}