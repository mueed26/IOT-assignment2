import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
    temp: number;
    humid: number;
    gas: number;
    timestamp: string;
    
}

const SensorDataSchema: Schema = new Schema({
    temp: { type: Number, required: true },
    humid: { type: Number, required: true },
    gas: { type: Number, required: true },
    timestamp: { type: String, required: true },
});

// Checks if model exists before creating to avoid Next.js hot-reload errors
export default mongoose.models.SensorReadings || mongoose.model<ISensorData>('SensorReadings', SensorDataSchema, 'sensor_readings');