'use client';

import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import SkeletonText from "@/components/loader/SkeletonText";
import FormInput from "@/components/FormInput";
import axios from "axios";
import User from "@/components/User";
import SkeletonProfile from "@/components/loader/SkeletonProfile";

export default function Friends() {
    
    var authContext = useContext(AuthContext);

    const [friendData, setFriendData] = useState<{incoming: any[], outgoing: any[], friends: any[]}>();
    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || friendData) return;

        axios.get('/api/user/friend', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setFriendData(res.data);
        })
    }, [authContext.awaitAuth]);

    // Handle updates sent from server via WebSocket
    function onUpdate(data: any) {
        if (data.type != "friends") return;

        var newFriendData = friendData || {incoming: [], outgoing: [], friends: []};
        if (data.incoming) updateArray(newFriendData.incoming, data.incoming);
        if (data.outgoing) updateArray(newFriendData.outgoing, data.outgoing);
        if (data.friends) updateArray(newFriendData.friends, data.friends);
        setFriendData(newFriendData);
    }
    function updateArray(arr: any[], data: any) {
        for (let i of data.push||[]) arr.push(i);
        for (let items of data.pull||[]) arr = arr.filter(x => items.indexOf(x) == -1);
        arr.sort((a, b) => a.username.localeCompare(b.username));
    }



    const searchElement = useRef<FormInput>(null);
    const [searchResults, setSearchResults] = useState<Array<any>>([]);

    function updateSearch() {
            var q = searchElement.current?.getValue().replaceAll(/[^\w]/g, '');
            if (!q) return setSearchResults([]);
            axios.get("/api/user/search", {params: {q}, headers: {Authorization: authContext.resourceToken}}).then(res => {
                setSearchResults(res.data.results);
            }).catch(() => {
                console.error("Failed to search users");
            });
    }

    function addFriend(user: any) {
        axios.post("/api/user/friend", {to: user.id}, {headers: {Authorization: authContext.resourceToken}}).catch(()=>{
            console.error("Failed to add friend");
        });
        searchElement.current?.setValue("");
        setSearchResults([]);
    }

    function acceptFriend(user: any) {
        var data = friendData;
        if (data) {
            data.incoming = data.incoming.filter(x => x.id != user.id);
            setFriendData(data);
        }
        axios.post("/api/user/friend?acceptOnly=true", {to: user.id}, {headers: {Authorization: authContext.resourceToken}}).catch(() => {
            console.error("Failed to accept friend");
        });
    }



    const [pendingRemoval, setPendingRemoval] = useState<any>();

    function removeFriend(user: any) {
        var data = friendData;
        if (data) {
            data.incoming = data.incoming.filter(x => x.id != user.id);
            data.outgoing = data.outgoing.filter(x => x.id != user.id);
            data.friends = data.friends.filter(x => x.id != user.id);
            setFriendData(data);
        }
        setPendingRemoval(undefined);
        axios.delete(`/api/user/friend?user=${user.id}`, {headers: {Authorization: authContext.resourceToken}}).catch(() => {
            console.error("Failed to remove friend");
        });
    }

    return (
        <>
            <div className="w-full flex flex-col px-4 items-center mt-2 mb-4 pr-6">
                <div className="w-full max-w-lg px-4 py-1 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Add Friends</div>
                <div className="relative w-full max-w-sm">
                    <FormInput ref={searchElement} id="search" label="" attr={{placeholder: "Search Users", onChange: updateSearch, autoComplete: 'off'}} width={384}></FormInput>
                    {searchResults.length > 0 && 
                    <div className="absolute z-20 w-full flex flex-col gap-2 gradient bg-opacity-100 shadow-lg rounded-lg">
                        {searchResults.map((x, i) => 
                            <button className="bg-black bg-opacity-0 hover:bg-opacity-10 transition-colors" key={x.id} onClick={()=>{addFriend(x)}}>
                                <User {...x}></User>
                            </button>
                        )}
                    </div>}
                </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row px-4 py-2 md:py-4 h-screen overflow-y-auto">
                <div className="md:flex-1 flex flex-col gap-4 relative md:h-full">
                    <div className="md:flex-1 relative md:h-full md:overflow-y-auto">
                        <div className="sticky flex z-10 top-0 left-0 right-0 mr-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg md:text-lg font-bold">Incoming Friend Requests</div>
                        <div className="flex flex-col w-full mt-2">
                            {!friendData ? 
                                <div className="italic font-bold text-center opacity-50">Loading...</div> 
                                :
                                (friendData.incoming.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Incoming Friend Requests</div> 
                                : friendData.incoming.map((x, i) => 
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
                            {!friendData ? 
                                <div className="italic font-bold text-center opacity-50">Loading...</div> 
                                :
                                (friendData.outgoing.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Outgoing Friend Requests</div> 
                                : friendData.outgoing.map((x, i) => 
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
                        {!friendData ? 
                                [10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                                    <div className="flex items-center gap-2 py-1 w-full" key={i}>
                                        <SkeletonProfile/>
                                        <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                    </div>
                                )
                                :
                                (friendData.friends.length == 0 ? 
                                    <div className="italic font-bold text-center opacity-50">No Friends :(</div> 
                                : friendData.friends.map((x, i) => 
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
