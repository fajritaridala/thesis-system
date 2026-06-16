import uploader from "../../common/utils/uploader";
import { VerifyDto } from "./verify.dto";

const verifyService = {
  certificate: async (options: VerifyDto) => {
    const { data } = await uploader.pinata.verify(options.cid);
    return data;
  },
};

export default verifyService;
