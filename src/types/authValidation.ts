import { object, string } from "yup";

export const SignUpValidator = {
    email: string().required("Required")
        .matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Invalid email address")
        .max(256, "Max of 256 characters"),
    user: string().required("Required")
        .matches(/^[\w]*$/, "Only letters, numbers, and underscores are allowed")
        .min(3, "Must be at least 3 characters")
        .max(24, "Must be at max 24 characters"),
    pass: string().required("Required")
        .matches(/^[\w\-@$!%*#?&]*$/, "Only letters, numbers, and the following symbols are allowed: _-@$!%*#?&")
        .min(8, "Must be at least 8 characters")
        .max(32, "Must be at max 32 characters")
        .matches(/^(?=.*[A-Za-z])(?=.*\d).*$/, "Must contain at least 1 letter and 1 number")
}

export const LoginValidator = {
    user: string().required("Required").test("username_or_email", "Invalid username or email", (val)=>{
        return string().matches(/^[\w]*$/).min(3).max(24).isValidSync(val) || 
            string().matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).max(256).isValidSync(val);
    }),
    pass: string().required("Required")
        .matches(/^[\w\-@$!%*#?&]{1,32}$/, "Invalid Password")
};