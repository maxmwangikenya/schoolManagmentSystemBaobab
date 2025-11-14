import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clockInTime: {
      type: Date,
    },
    clockOutTime: {
      type: Date,
    },
    totalHours: {
      type: Number, // in hours (e.g. 7.5)
      default: 0,
    },
    ipAddressIn: {
      type: String,
    },
    ipAddressOut: {
      type: String,
    },
    geoIn: {
      country: String,
      city: String,
      lat: Number,
      lon: Number,
    },
    geoOut: {
      country: String,
      city: String,
      lat: Number,
      lon: Number,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Ensure unique attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
