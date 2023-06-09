import FormInput from "@/components/FormInput";
import { AuthContext } from "@/context/AuthContext";
import { SignUpValidator } from "@/utils/validation/authValidation";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useRef, useState } from "react";
import { NextPageWithLayout } from "./_app";
import LoginLayout from "@/components/layouts/LoginLayout";
import { NotificationContext } from "@/context/NotificationContext";

const SignUp: NextPageWithLayout = () => {

    const authContext = useContext(AuthContext);
    const router = useRouter();
    const notify = useContext(NotificationContext);

    const email = useRef<FormInput>(null);
    const user = useRef<FormInput>(null);
    const pass = useRef<FormInput>(null);
    const pass2 = useRef<FormInput>(null);

    var [loading, setLoading] = useState<boolean>(false);

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        if (!email.current?.testInput() || !user.current?.testInput() || !pass.current?.testInput() || !pass2.current?.testInput()) return;
        if (pass.current.getValue() !== pass2.current.getValue()) return pass2.current.setState({valid: false, error: "Passwords must match"});

        setLoading(true);
        axios.post('/api/auth/signup', {email: email.current.getValue(), user: user.current.getValue(), pass: pass.current.getValue()})
        .then((res)=>{
            authContext.updateAuth(res.data["refresh_token"], res.data["resource_token"]);
            router.push('/');
        }).catch(notify).finally(()=>{setLoading(false)})
    }
    
    return (
        <div className="rounded-lg shadow-lg px-6 sm:px-16 py-4 bg-slate-200 dark:bg-slate-800">
            <h1 className="mb-4 text-2xl font-bold text-center">Sign Up</h1>
            <form className="flex flex-col items-center gap-2" onSubmit={onSubmit}>
                <FormInput ref={email} id="email" label="Email" validator={SignUpValidator.email} 
                    attr={{autoComplete: "email", autoFocus: true}}>
                </FormInput>

                <FormInput ref={user} id="user" label="Username" validator={SignUpValidator.user}  
                    attr={{autoComplete: "off"}}>
                </FormInput>
                
                <FormInput ref={pass} id="pass" label="Password" validator={SignUpValidator.pass} 
                    attr={{type: "password", autoComplete: "new-password"}}>
                </FormInput>

                <FormInput ref={pass2} id="pass2" label="Confirm Password" validator={SignUpValidator.pass} 
                    attr={{type: "password", autoComplete: "new-password"}}>
                </FormInput>
                
                
                <div className="text-center my-2">
                    <input type="submit" value={"Continue"} className={`w-min rounded-lg shadow font-semibold mx-1 px-4 py-[2px] transition-all text-navy-50 ${!loading ? 'cursor-pointer bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105' : 'bg-blue-600 dark:bg-blue-800'}`}></input>
                </div>
            </form>
            <div className="text-center font-semibold">Already have an account? <Link href="/login" className="text-blue-500">Log In!</Link></div>
        </div>
    )
}
SignUp.getLayout = (page) => <LoginLayout>{page}</LoginLayout>
export default SignUp;

export function getStaticProps() {
    return {props: {title: "Sign Up"}}
}