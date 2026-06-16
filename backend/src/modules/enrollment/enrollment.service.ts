import mongoose, { ClientSession } from "mongoose";
import { QueryDto } from "../../common/dtos/query.dto";
import generateHash from "../../common/utils/hashing";
import toeflConverter from "../../common/utils/toeflConverter";
import uploader from "../../common/utils/uploader";
import ScheduleModel from "../schedule/models/schedule.model";
import {
  ApprovalEnrollOptionsDto,
  BlockchainOptionsDto,
  FindAllEnrollOptionsDto,
  FindAllEnrollQueryDto,
  GetScheduleEnrollOptionsDto,
  RegisterEnrollOptionsDto,
  RegisterEnrollParamsDto,
  SubmitEnrollOptionsDto,
} from "./dtos/enrollment.req.dto";
import { STATUS } from "./enrollment.constant";
import { EnrollPinataJson } from "./enrollment.interface";
import EnrollmentModel from "./model/enrollment.model";

const enrollmentService = {
  register: async (options: RegisterEnrollOptionsDto) => {
    // preparing
    let session: ClientSession | null = null;
    let imagePublicId: string | null = null;

    if (!options.file) throw new Error("file wajib ada");
    const image = await uploader.cloudinary.uploadFile(
      options.file,
      options.body.fullName,
    );
    imagePublicId = image.public_id;

    const { paymentDate, ...data } = options.body;
    const registrant = {
      candidate: data,
      paymentDate,
      scheduleId: new mongoose.Types.ObjectId(options.params.scheduleId),
      participantId: new mongoose.Types.ObjectId(options.user.participantId),
      paymentId: image.public_id,
      paymentProof: image.secure_url,
    };

    // database processing
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // tambah jumlah pendaftar di collection schedules
      const schedule = await ScheduleModel.findOneAndUpdate(
        {
          _id: options.params.scheduleId,
          quota: { $gte: 0 },
          deletedAt: null,
        },
        {
          $inc: { quota: -1, registrants: 1 },
        },
        { session, new: true },
      );
      if (!schedule) throw new Error("jadwal penuh");

      // simpan data pendaftar ke colecction enrollments
      const save = await EnrollmentModel.create(registrant);
      await session.commitTransaction();

      const { __v, updatedAt, ...result } = save.toObject();
      return result;
    } catch (error) {
      if (imagePublicId) {
        console.warn([`[Rollback] menghapus gambar sampah: ${imagePublicId}`]);
        await uploader.cloudinary.remove(imagePublicId);
      }
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  findAll: async (query: FindAllEnrollQueryDto) => {
    const skip = (query.page - 1) * query.limit;
    const options: FindAllEnrollOptionsDto = {
      skip,
      limit: query.limit,
    };
    if (query.status) {
      options.status = query.status;
    }
    if (query.search) {
      options.search = query.search;
    }
    const { data, pagination } = await EnrollmentModel.findAll(options);
    const result = data.map((item) => ({
      enrollId: item.enrollId,
      scheduleId: item.scheduleId,
      participantId: item.participantId,
      scheduleDate: item.scheduleDate,
      serviceName: item.serviceName,
      registerAt: item.registerAt,
      paymentDate: item.paymentDate,
      paymentProof: item.paymentProof,
      status: item.status,
      fullName: item.fullName,
      gender: item.gender,
      birthDate: item.birthDate,
      email: item.email,
      phoneNumber: item.phoneNumber,
      nim: item.nim,
      faculty: item.faculty,
      major: item.major,
    }));

    return { result, pagination };
  },
  getScheduleParticipants: async (
    query: QueryDto,
    params: RegisterEnrollParamsDto,
  ) => {
    const skip = (query.page - 1) * query.limit;
    const options: GetScheduleEnrollOptionsDto = {
      skip,
      limit: query.limit,
      scheduleId: params.scheduleId,
    };
    if (query.search) {
      options.search = query.search;
    }
    const data = await EnrollmentModel.getScheduleParticipants(options);
    return data;
  },
  approval: async (options: ApprovalEnrollOptionsDto) => {
    const verifiedAt = new Date(Date.now());
    if (!Object.values(STATUS).includes(options.body.status)) {
      throw new Error("Invalid status");
    }
    const data = await EnrollmentModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(options.params.enrollId),
        status: STATUS.PENDING,
      },
      {
        status: options.body.status,
        verifiedAt,
        verifiedBy: new mongoose.Types.ObjectId(options.adminId),
      },
    );
    if (data.matchedCount === 0)
      throw new Error(
        `Gagal: data tidak ditemukan atau peserta telah diproses sebelumnya`,
      );

    return { data, message: `peserta telah ${options.body.status}` };
  },
  submitScore: async (options: SubmitEnrollOptionsDto) => {
    console.log(options.params.participantId);
    const participant = await EnrollmentModel.findParticipant({
      participantId: options.params.participantId,
      enrollId: options.params.enrollId,
    });
    if (!participant) throw new Error("Peserta tidak ditemukan");
    console.log(participant);
    const { certificate, address } = participant;

    const score = toeflConverter(options.body);

    const data: EnrollPinataJson = {
      serviceName: certificate.serviceName,
      scheduleDate: certificate.scheduleDate,
      fullName: certificate.fullName,
      gender: certificate.gender,
      birthDate: certificate.birthDate,
      email: certificate.email,
      phoneNumber: certificate.phoneNumber,
      nim: certificate.nim,
      faculty: certificate.faculty,
      major: certificate.major,
      listening: score.listening,
      reading: score.reading,
      structure: score.structure,
      totalScore: score.totalScore,
    };

    let fileName: string;
    if (data.fullName.toLowerCase().includes(" ")) {
      fileName = `${data.nim}-${data.fullName.split(" ")[0]}.json`;
    } else {
      fileName = `${data.nim}-${data.fullName}.json`;
    }

    // const { cid } = await uploader.pinata.json(data, fileName);
    const { cid } = await uploader.pinata.json(data, fileName);
    const hash = `0x${generateHash({ cid, address })}`;

    return {
      cid,
      hash,
      participantId: options.params.participantId,
      enrollId: options.params.enrollId,
    };
  },
  blockchainSuccess: async (options: BlockchainOptionsDto) => {
    const hash = options.body.hash;
    const participantId = options.params.participantId;
    const result = await EnrollmentModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(options.params.enrollId),
        participantId: new mongoose.Types.ObjectId(participantId),
      },
      {
        $set: {
          hash,
          status: STATUS.FINISHED,
        },
      },
      {
        new: true,
      },
    );
    return result;
  },
};

export default enrollmentService;
