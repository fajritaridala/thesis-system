import EnrollmentModel from "../enrollment/model/enrollment.model";
import { FindActivityResponse } from "./dtos/user.res";

const userService = {
  findActivity: async (participantId: string) => {
    const enrollment = await EnrollmentModel.findActivity(participantId);
    const result: FindActivityResponse[] = enrollment.map((item) => {
      return {
        enrollId: item.enrollId,
        participantId: item.participantId,
        serviceName: item.serviceName,
        scheduleDate: item.scheduleDate,
        status: item.status,
        hash: item.hash,
      };
    });
    return result;
  },
};

export default userService;
