import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  var authContext = useContext(AuthContext);
  const router = useRouter();

  const [data, setData] = useState<any>();

  useEffect(()=>{
      if (!authContext.awaitAuth && !authContext.loggedIn) router.push('/login?url='+router.route);
  }, [authContext]);

  useEffect(()=>{
      if (authContext.awaitAuth || !authContext.loggedIn || data) return;

      axios.get('/api/user', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
          setData(res.data);
      })
  }, [authContext.awaitAuth]);

  if (data) return (
      <>
          <div>TODO - Hello, {data.username}</div>
          <code>{JSON.stringify(data, undefined, 2)}</code>
      </>
  );
  return (
      <>
          TODO - Skeleton Loader
      </>
  )
}
