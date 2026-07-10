import { Response } from "express";

interface PaginationMeta {
    page?: number;
    limit?: number;
    hasMore?: number;
    nextCursor?: number;
    total?: number;
}

interface SuccessOptions<T> {
    res: Response,
    statusCode?: number,
    message: string,
    data?: T,
    pagination?: PaginationMeta,
}

interface ErrorOption {
    res: Response,
    statusCode?: number,
    message: string,
    errors?: Record<string, string | string[]>
}


export const sendSuccess = <T>({
    res,
    statusCode = 200,
    message,
    data,
    pagination,
}: SuccessOptions<T>): void => {
    const body: Record<string, unknown> = {
        success: true,
        message,
    };

    if (data !== undefined) body.data = data;
    if (pagination !== undefined) body.pagination = pagination;

    res.status(statusCode).json(body);
};

export const sendError = ({
    res,
    statusCode = 500,
    message,
    errors
}: ErrorOption): void => {
    const body: Record<string, unknown> = {
        success: false,
        message,
    }

    if (errors) body.errors = errors;
    res.status(statusCode).json(body);
}



export const ApiResponse = {
    ok: <T>(res: Response, message: string, data?: T) =>
        sendSuccess({ res, statusCode: 200, message, ...(data !== undefined && { data }) }),

    created: <T>(res: Response, message: string, data?: T) =>
        sendSuccess({ res, statusCode: 201, message, ...(data !== undefined && { data }) }),

    list: <T>(
        res: Response,
        message: string,
        data: T,
        pagination?: PaginationMeta
    ) => sendSuccess({ res, statusCode: 200, message, data, ...(pagination !== undefined && { pagination }) }),

    badRequest: (res: Response, message: string, errors?: Record<string, string | string[]>) =>
        sendError({ res, statusCode: 400, message, ...(errors !== undefined && { errors }) }),

    unauthorized: (res: Response, message = "Unauthorized") =>
        sendError({ res, statusCode: 401, message }),

    forbidden: (res: Response, message = "Forbidden") =>
        sendError({ res, statusCode: 403, message }),

    notFound: (res: Response, message = "Not found") =>
        sendError({ res, statusCode: 404, message }),

    conflict: (res: Response, message: string) =>
        sendError({ res, statusCode: 409, message }),

    serverError: (res: Response, message = "Internal server error") =>
        sendError({ res, statusCode: 500, message }),
};
