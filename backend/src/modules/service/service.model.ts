import mongoose from "mongoose";
import { Service } from "./service.interface";

const Schema = mongoose.Schema;

const ServiceSchema = new Schema<Service>(
  {
    name: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: true },
    price: { type: Schema.Types.Number, required: true },
    notes: { type: Schema.Types.String },
  },
  {
    timestamps: true,
  },
);

const ServiceModel = mongoose.model<Service>("services", ServiceSchema);

export default ServiceModel;
