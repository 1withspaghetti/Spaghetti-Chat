import { number, string } from "yup";

export const UserIdValidatorString = string().required("Required").matches(/^\d+$/, "Invalid user id").min(1, "Invalid user id").max(15, "Invalid user id");
export const UserIdValidatorNumber = number().required("Required").min(1, "Invalid user id").max(281474976710655, "Invalid user id");
export const UsernameSearchValidator = string().required("Required").matches(/^[\w]*$/, "Invalid username").max(32, "Username too long");