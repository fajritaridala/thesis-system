import { PinataSDK } from "pinata";
import { PINATA_GATEWAY, PINATA_JWT } from "./env";

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT!,
  pinataGateway: PINATA_GATEWAY,
});

export default pinata;

