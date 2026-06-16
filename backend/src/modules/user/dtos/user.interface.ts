import { EnrollModel } from "../../enrollment/enrollment.interface";
import { FindActivityResponse } from "./user.res";

interface UserStatic extends EnrollModel {
  findActivity: (participantId: string) => Promise<FindActivityResponse[]>;
}

export type { UserStatic };
