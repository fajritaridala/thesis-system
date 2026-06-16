import { Response } from "express";
import { QueryDto, querySchema } from "../../common/dtos/query.dto";
import response from "../../common/utils/response";
import { ReqUser } from "../auth/auth.dto";
import {
  ApprovalEnrolDto,
  ApprovalEnrolParamsDto,
  ApprovalEnrollOptionsDto,
  BlockchainDto,
  BlockchainOptionsDto,
  BlockchainParamsDto,
  EnrollUserDto,
  FindAllEnrollQueryDto,
  RegisterEnrollDto,
  RegisterEnrollOptionsDto,
  RegisterEnrollParamsDto,
  SubmitEnrollDto,
  SubmitEnrollOptionsDto,
  SubmitEnrollParamsDto,
  approvalEnrollParamsSchema,
  approvalEnrollSchema,
  blockchainParamsSchema,
  blockchainSchema,
  enrollUserSchema,
  findAllEnrollQuerySchema,
  registerEnrollParamsSchema,
  registerEnrollSchema,
  submitEnrollParamsSchema,
  submitEnrollSchema,
} from "./dtos/enrollment.req.dto";
import enrollmentService from "./enrollment.service";

const enrollmentController = {
  register: async (req: ReqUser, res: Response) => {
    const file = req.file as Express.Multer.File;
    const user: EnrollUserDto = await enrollUserSchema.validate({
      participantId: req.user?._id,
    });
    const params: RegisterEnrollParamsDto =
      await registerEnrollParamsSchema.validate(req.params);
    const body: RegisterEnrollDto = await registerEnrollSchema.validate(
      req.body,
    );
    const options: RegisterEnrollOptionsDto = {
      user,
      params,
      body,
      file,
    };
    const result = await enrollmentService.register(options);
    return response.success(res, result, "pendaftaran berhasil");
  }, // peserta mendaftar tes
  findAll: async (req: ReqUser, res: Response) => {
    const query: FindAllEnrollQueryDto =
      await findAllEnrollQuerySchema.validate(req.query);
    const { result, pagination } = await enrollmentService.findAll(query);
    return response.pagination({
      res,
      data: result,
      pagination,
      message: "data berhasil diambil",
    });
  }, // tampilkan semua peserta
  getScheduleParticipants: async (req: ReqUser, res: Response) => {
    const query: QueryDto = await querySchema.validate(req.query);
    const params: RegisterEnrollParamsDto =
      await registerEnrollParamsSchema.validate(req.params);
    const result = await enrollmentService.getScheduleParticipants(
      query,
      params,
    );
    return response.pagination({
      res,
      data: result.data,
      pagination: {
        current: result.pagination.current,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
      message: "data berhasil diambil",
    });
  }, // tampilkan seluruh peserta dijadwal tertentu
  approval: async (req: ReqUser, res: Response) => {
    const params: ApprovalEnrolParamsDto =
      await approvalEnrollParamsSchema.validate(req.params);
    const body: ApprovalEnrolDto = await approvalEnrollSchema.validate(
      req.body,
    );
    const adminId = req.user?._id;
    if (!adminId) throw new Error("id admin tidak ditemukan");
    const options: ApprovalEnrollOptionsDto = {
      params,
      body,
      adminId,
    };
    const result = await enrollmentService.approval(options);
    return response.success(res, result.data, result.message);
  }, // admin melakukan approve ke peserta yang mendaftar
  submitScore: async (req: ReqUser, res: Response) => {
    console.log(req.body)
    const params: SubmitEnrollParamsDto =
      await submitEnrollParamsSchema.validate(req.params);
    const body: SubmitEnrollDto = await submitEnrollSchema.validate(req.body);
    const options: SubmitEnrollOptionsDto = { params, body };
    const result = await enrollmentService.submitScore(options);
    return response.success(res, result, "berhasil mendapatkan cid dan hash");
  }, // admin melakukan scoring ke peserta yang mendaftar
  blockchainSuccess: async (req: ReqUser, res: Response) => {
    const params: BlockchainParamsDto = await blockchainParamsSchema.validate(
      req.params,
    );
    const body: BlockchainDto = await blockchainSchema.validate(req.body);
    const options: BlockchainOptionsDto = {
      params,
      body,
    };
    const result = await enrollmentService.blockchainSuccess(options);
    return response.success(res, result, "berhasil mendapatkan cid dan hash");
  },
};

export default enrollmentController;
