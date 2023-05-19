import { HttpStatusCode, Method } from "axios";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ValidationError } from "yup";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status?: number) {
        super(message || "Internal Server Error");
        this.status = status || HttpStatusCode.InternalServerError;
    }
}

type ApiMethodHandlers = {
    [key in Uppercase<Method>]?: NextApiHandler;
};

export function apiHandler(handlers: ApiMethodHandlers): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const method = req.method ? req.method.toUpperCase() as keyof ApiMethodHandlers : undefined;

            if (!method) throw new ApiError("Http Method not allowed", HttpStatusCode.MethodNotAllowed);

            const handler = handlers[method];

            if (!handler) throw new ApiError("Http Method not allowed", HttpStatusCode.MethodNotAllowed);

            await handler(req, res);
        } catch (err) {
            errorHandler(err, req, res);
        }
    }
}

export function errorHandler(err: unknown, req: NextApiRequest, res: NextApiResponse) {
    if (err instanceof ApiError) {
        res.status(err.status).json({error: err.message});
    } else if (err instanceof ValidationError) {
        res.status(HttpStatusCode.BadRequest).json({error: err.errors[0] || "Invalid Data"});
    } else {
        console.error("Error whilst handling request to " + req.url + ":\n", err)
        res.status(HttpStatusCode.InternalServerError).json({error: "Internal Server Error"});
    }
}