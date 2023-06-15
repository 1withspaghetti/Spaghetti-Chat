import FormInput from "@/components/FormInput";
import { AuthContext } from "@/context/AuthContext";
import { LoginValidator } from "@/utils/validation/authValidation";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useRef, useState } from "react";
import { NextPageWithLayout } from "./_app";
import LoginLayout from "@/components/layouts/LoginLayout";
import { NotificationContext } from "@/context/NotificationContext";

const Login: NextPageWithLayout = () => {

    const authContext = useContext(AuthContext);
    const router = useRouter();
    const notify = useContext(NotificationContext);

    const user = useRef<FormInput>(null);
    const pass = useRef<FormInput>(null);

    var [loading, setLoading] = useState<boolean>(false);

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        if (!user.current?.testInput() || !pass.current?.testInput()) return;

        setLoading(true);
        axios.post('/api/auth/login', {user: user.current.getValue(), pass: pass.current.getValue()})
        .then((res)=>{
            authContext.updateAuth(res.data["refresh_token"], res.data["resource_token"]);
            router.push(typeof router.query.url === 'string' ? router.query.url : '/');
        }).catch(notify).finally(()=>{setLoading(false)});
    }
    
    return (
        <div className="rounded-lg shadow-lg px-6 sm:px-16 py-4 bg-slate-200 dark:bg-slate-800">
            <h1 className="mb-4 text-2xl font-bold text-center" onClick={()=>{console.log(authContext.resourceToken)}}>Login</h1>
            <form className="flex flex-col items-center gap-2" onSubmit={onSubmit}>
                <FormInput ref={user} id="user" label="Username or Email" validator={LoginValidator.user} 
                    attr={{autoComplete: "username", autoFocus: true}}></FormInput>

                <FormInput ref={pass} id="pass" label="Password" validator={LoginValidator.pass} 
                    attr={{type: "password", autoComplete: "current-password"}}>
                        <Link href="/password-recovery" className="text-sm text-blue-500" style={{lineHeight: "24px"}}>Forgot Password</Link>
                </FormInput>
                <div className="text-center my-2">
                    <input type="submit" value={"Continue"} className="w-min rounded-lg shadow font-semibold mx-1 px-4 py-[2px] cursor-pointer transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105"></input>
                </div>
            </form>
            <div className="text-center font-semibold">Don&apos;t have an account? <Link href="/sign-up" className="text-blue-500">Sign Up!</Link></div>
        </div>
    )
}
Login.getLayout = (page) => <LoginLayout>{page}</LoginLayout>
export default Login;

export function getStaticProps() {
    return {props: {title: "Login"}}
}