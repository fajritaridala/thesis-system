import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import * as yup from "yup";
import { ErrorDto } from "../dtos/error.dto";

/**
 * Custom Application Error
 * Gunakan class ini untuk throw error dengan status code tertentu
 * Contoh: throw new AppError("Data tidak ditemukan", 404);
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * Middleware ini akan menangkap semua error yang terjadi di aplikasi
 * dan mengembalikan response dengan format yang konsisten.
 * 
 * Jenis error yang di-handle:
 * 1. Yup ValidationError - Input validation dari request body/query/params
 * 2. MongoDB Duplicate Key (E11000) - Data duplikat yang melanggar unique constraint
 * 3. MongoDB CastError - Format ID tidak valid (bukan ObjectId)
 * 4. MongoDB ValidationError - Schema validation error
 * 5. AppError - Custom error yang di-throw manual dengan status code
 * 6. Generic Error - Error lainnya (termasuk throw new Error())
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log error untuk debugging (hanya tampilkan di console server)
  console.error("Error Log:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan internal pada server";
  let data: any = null;

  // ============================================
  // 1. YUP Validation Error
  // Terjadi ketika input dari user tidak sesuai dengan schema validasi
  // Contoh: field required tidak diisi, format email salah, dll
  // ============================================
  if (err instanceof yup.ValidationError) {
    statusCode = 400;
    message = "Data yang Anda masukkan tidak valid";
    data = err.inner.length
      ? err.inner.map((e) => ({
          field: e.path,
          message: e.message,
        }))
      : [{ field: err.path, message: err.message }];
  }

  // ============================================
  // 2. MongoDB Duplicate Key Error (E11000)
  // Terjadi ketika mencoba menyimpan data yang melanggar unique constraint
  // Contoh: email sudah terdaftar, username sudah dipakai, dll
  // ============================================
  else if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "Data";
    const value = err.keyValue ? Object.values(err.keyValue)[0] : "";
    message = `${field} "${value}" sudah terdaftar. Silakan gunakan ${field} yang lain.`;
  }

  // ============================================
  // 3. MongoDB CastError
  // Terjadi ketika format ID tidak valid (bukan ObjectId 24 karakter hex)
  // Contoh: GET /schedules/invalid-id
  // ============================================
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Format ID tidak valid: "${err.value}". ID harus berupa 24 karakter hexadecimal.`;
  }

  // ============================================
  // 4. MongoDB Validation Error
  // Terjadi ketika data tidak sesuai dengan schema Mongoose
  // Contoh: required field tidak ada, enum value tidak valid, dll
  // ============================================
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Data tidak sesuai dengan format yang diharapkan";
    data = Object.values(err.errors).map((val: any) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // ============================================
  // 5. JWT Errors
  // Terjadi ketika token tidak valid atau sudah expired
  // ============================================
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token tidak valid. Silakan login kembali.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Sesi Anda telah berakhir. Silakan login kembali.";
  }

  // ============================================
  // 6. Generic Error / Custom Error
  // Termasuk: throw new Error("message") atau throw new AppError("message", code)
  // Di production, pesan error 500 akan disembunyikan untuk keamanan
  // ============================================
  else {
    // Jika status 500 dan production, sembunyikan detail error
    if (statusCode === 500 && process.env.NODE_ENV === "production") {
      message = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
    } else {
      // Tampilkan pesan asli untuk development atau non-500 errors
      message = err.message;
    }

    // Tampilkan stack trace di development untuk debugging
    if (process.env.NODE_ENV === "development") {
      data = err.stack;
    }
  }

  // Format response yang konsisten
  const responsePayload: ErrorDto = {
    meta: {
      status: statusCode,
      message,
    },
    data,
  };

  return res.status(statusCode).json(responsePayload);
};

export default errorHandler;

