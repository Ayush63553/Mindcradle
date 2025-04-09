import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Razorpay from "razorpay";
import url from "url";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_xc7S1DH28iB6RI",
  key_secret: "26wDD931tPd9pRm9EO0RUDJO",
});

export const createBooking = async (req, res) => {
  const doctor = await Doctor.findById(req.params.doctorId);
  const user = await User.findById(req.userId);
  const amount = doctor.ticketPrice * 100;
  const options = {
    amount: amount,
    currency: "INR",
    receipt: "xyz@gmail.com",
  };

  razorpayInstance.orders.create(options, async (err, order) => {
    if (!err) {
      res.status(200).json({
        success: true,
        message: "Booking Successfull",
        order_id: order.id,
        key_id: "rzp_test_xc7S1DH28iB6RI",
        amount: amount,
        contact: "9876543210",
        name: "xyz",
        email: "abc@gmail.com",
        doctor: doctor ? doctor._id : null,
        user: user ? user._id : null,
        ticketPrice: doctor ? doctor.ticketPrice : null,
      });
    } else {
      res.status(400).json({ success: false, message: "Something Went Wrong" });
    }
  });
};

async function refreshAccessToken() {
  try {
    const newRefreshToken = response.data.refresh_token;

    // Update environment variables with new tokens
    process.env.REACT_APP_ZOOM_AT = newAccessToken;
    process.env.ZOOM_REFRESH_TOKEN = newRefreshToken;

    console.log("Access token refreshed successfully");
  } catch (error) {
    console.error("Error refreshing access token:");
    throw error;
  }
}

const zoomMeet = async (did) => {
  try {
    console.log(process.env.ZOOM_REFRESH_TOKEN);
    const params = new url.URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: `${process.env.ZOOM_REFRESH_TOKEN}`,
    });
    // console.log("Meeting se pehle", params);

    const ATresponse = await axios.post(
      "https://zoom.us/oauth/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    // console.log("ACcess token ke pehle gaya!!");
    const newAccessToken = ATresponse.data.access_token;
    // console.log("ACcess token a gaya!!");

    const headers = {
      Authorization: `Bearer ${newAccessToken}`,
    };

    const response = await axios({
      method: "post",
      url: "https://api.zoom.us/v2/users/me/meetings",
      headers,
      data: {
        topic: `Meeting with Dr.${did}`,
        type: 2,
        start_time: "2021-05-10T12:10:10Z",
        duration: "3",
        settings: {
          host_video: true,
          participant_video: false, //!initial change it
          join_before_host: true,
          mute_upon_entry: "true",
          watermark: "true",
          audio: "voip",
          auto_recording: "cloud",
        },
      },
    });

    return {
      start_url: response.data.start_url,
      join_url: response.data.join_url,
    };
  } catch (error) {
    console.error("Error in meeting creation:", error.response.data);
    res.status(500).json({ error: "Error in meeting creation" });
    throw error;
  }
};

// export const newBooking = async (req, res) => {
//   const { did, uid, price, timeSlot } = req.body;
//   try {
//     const isAlreadyBooked = await Booking.findOne({
//       doctor: did,
//       timeSlot: timeSlot,
//     });
//     if (isAlreadyBooked) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Time slot is already booked" });
//     }

//     const { start_url, join_url } = await zoomMeet(did);
//     // console.log(start_url, join_url);

//     const booking = new Booking({
//       doctor: did,
//       user: uid,
//       ticketPrice: price,
//       timeSlot: timeSlot,
//       start_url,
//       join_url,
//     });

//     await booking.save();

//     // Remove booked time slot from the database
//     await Doctor.findByIdAndUpdate(did, { $pull: { timeSlots: timeSlot } });

//     res.status(200).json({ success: true, message: "Booking Done" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: "Something Went Wrong" });
//   }
// };

export const newBooking = async (req, res) => {
  const { did, uid, price, timeSlot } = req.body;
  try {
    // Check if time slot is already booked
    const isAlreadyBooked = await Booking.findOne({
      doctor: did,
      timeSlot: timeSlot,
    });
    if (isAlreadyBooked) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot is already booked" });
    }

    // Generate unique Jitsi meeting URLs
    const meetingId = uuidv4(); // Generate unique ID for the meeting
    const join_url = `https://meet.jit.si/${meetingId}`; // Patient join URL
    const start_url = join_url; // Doctor start URL (same for Jitsi)

    // Create the booking with Jitsi meeting links
    const booking = new Booking({
      doctor: did,
      user: uid,
      ticketPrice: price,
      timeSlot: timeSlot,
      start_url,
      join_url,
    });

    await booking.save();

    // Remove booked time slot from the doctor's availability
    await Doctor.findByIdAndUpdate(did, { $pull: { timeSlots: timeSlot } });

    res
      .status(200)
      .json({ success: true, message: "Booking Done", start_url, join_url });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(400).json({ success: false, message: "Something Went Wrong" });
  }
};

// const zoomMeet = async (did) => {
//   return {
//     start_url: `https://dummy-zoom-url.com/start-${did}`,
//     join_url: `https://dummy-zoom-url.com/join-${did}`,
//   };
// };
