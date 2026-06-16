import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TOEFLRecordModule", (module) => {
  const toeflRecord = module.contract("TOEFLRecord");
  return { toeflRecord };
});
