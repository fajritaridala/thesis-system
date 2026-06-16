import { Response } from "express";
import { Error as MongooseError } from "mongoose";
import * as yup from "yup";

type PaginationResponse = {
  current: number;
  total: number;
  totalPages: number;
};

type PaginationParams = {
  res: Response;
  data: any;
  message: string;
  pagination: PaginationResponse;
};

const response = {
  success: (
    res: Response,
    data: any,
    message: string,
    needsRegistration?: boolean,
  ) => {
    return res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
      needsRegistration,
    });
  },
  unauthorized: (res: Response, message: string = "unauthorized") => {
    return res.status(403).json({
      meta: {
        status: 403,
        message,
      },
      data: null,
    });
  },
  pagination: (params: PaginationParams) => {
    const { res, data, message, pagination } = params;
    return res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
      pagination,
    });
  },
  error: (res: Response, error: unknown, message: string) => {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        meta: {
          status: 400,
          message: "Validasi Gagal", // Pesan umum
        },
        data: {
          errors: error.inner.length
            ? error.inner.map((e) => ({ field: e.path, message: e.message }))
            : [{ field: error.path, message: error.message }],
        },
      });
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      const field = (error as any).keyPattern
        ? Object.keys((error as any).keyPattern)[0]
        : "Data";
      return res.status(409).json({
        meta: {
          status: 409,
          message: `${field} sudah terdaftar`,
        },
        data: null,
      });
    }
    if (error instanceof MongooseError.CastError) {
      return res.status(400).json({
        meta: { status: 400, message: `Format ${error.path} tidak valid` },
        data: null,
      });
    }
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      meta: {
        status: 500,
        message: message || "Terjadi kesalahan internal server",
      },
      // data: process.env.NODE_ENV === 'development' ? error : null,
      data: null,
    });
  },
};

export default response;
export type { PaginationResponse };
