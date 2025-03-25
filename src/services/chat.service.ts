import { Equal, Or } from "typeorm";
import { ApiError } from "../../utils/ApiError";
import { ConnectedUsers, io } from "../app";
import { db } from "../config/db";
import { Message } from "../entities/message";
import { User } from "../entities/user";

//message aa sakta hai, save message to db
export async function saveMessage(
  message: string,
  receiverId: string,
  senderId: string
) {
  //save message to db
  const msg = new Message();
  msg.message = message;
  msg.receiverId = receiverId;
  msg.senderId = senderId;
  try {
    await msg.save();
    //check user is connected or not
    if (Object.keys(ConnectedUsers).includes(`${receiverId}`)) {
      io.to(ConnectedUsers[receiverId]).emit("SendMessage", msg);
    }
    return msg;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", error);
  }
}
//fetch all messages based on senderId and receiverId, order by createdAt asc
export async function getAllMessages(receiverId: string, senderId: string) {
  try {
    const msg = await db.getRepository(Message).find({
      where: {
        receiverId: Or(Equal(receiverId), Equal(senderId)),
        senderId: Or(Equal(receiverId), Equal(senderId)),
      },
    });
    return msg;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", error);
  }
}

export async function getVideoCall(
  receiverId: string,
  sender: User,
  channelName: string
) {
  // send an scoket to the reciever
  try {
    const response = await io
      .to(ConnectedUsers[receiverId])
      .timeout(30000)
      .emitWithAck("incomingCall", {
        senderId: sender.id,
        senderProfilePicture: sender.profilePicture,
        senderName: sender.name,
        channelName,
      });
    if (response[0] === "ACCEPTED") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return new ApiError(400, "Recevier didn't respond", error);
  }
}
