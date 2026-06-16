import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./common/middlewares/error.middleware";
import router from "./common/utils/routes";
import dbConnect from "./config/db";
import { NODE_ENV, PORT } from "./config/env";
import swaggerSpec from "./docs/swagger.json";

const app = express();

dbConnect()
  .then((msg) => console.log("Database status: " + msg))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
app.use(errorHandler);

if (NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/api`);
  });
}

export default app;
