import { SubmitEnrollDto } from "../../modules/enrollment/dtos/enrollment.req.dto";

const listeningConverter = [
  24, 25, 26, 27, 28, 29, 30, 31, 32, 32, 33, 35, 37, 38, 39, 41, 41, 42, 43,
  44, 45, 45, 46, 47, 48, 48, 49, 49, 50, 51, 52, 52, 53, 53, 54, 54, 55, 56,
  57, 57, 58, 59, 60, 61, 62, 63, 65, 66, 67, 68,
];

const structureConverter = [
  20, 20, 21, 22, 23, 25, 26, 27, 29, 31, 33, 35, 36, 37, 38, 40, 40, 41, 42,
  43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 61, 63, 65,
  68, 68,
];

const readingConverter = [
  21, 22, 23, 23, 25, 26, 27, 28, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 52, 53, 54, 54,
  55, 56, 57, 58, 59, 60, 61, 63, 65, 66, 67,
];

const toeflConverter = (toefl: SubmitEnrollDto) => {
  const listening = listeningConverter[toefl.listening];
  const structure = structureConverter[toefl.structure];
  const reading = readingConverter[toefl.reading];

  const total = listening + structure + reading;

  const totalScore = Math.round((total / 3) * 10);
  return { totalScore, listening, structure, reading };
};

export default toeflConverter;
