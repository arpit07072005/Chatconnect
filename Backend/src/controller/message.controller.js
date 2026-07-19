import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js";
import { io, users } from "../index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const newFriend = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(req.user);
    const senderID = req.user._id;

    if (!email) {
      return res.status(401).json({ error: "please provide the email" });
    }
    const newUser = await User.findOne({ email }).select("-password");
    // console.log(newUser)
    if (!newUser) {
      return res.status(500).json({ error: "user not registered with given email" });
    }
    const receiverID = newUser?._id;

    if (senderID.toString() === receiverID.toString()) {
      return res.status(400).json({ error: "You can't add yourself" });
    }
    const participant = [senderID, receiverID].sort();
    const existing = await Conversation.findOne({
      participants: participant
    });

    if (existing) {
      return res.status(200).json({ message: "friend is already present" });
    }
    const newCon = await Conversation.create({
      participants: participant
    });
    const newConversation = await newCon.populate("participants", "-password");
    const senderFormatted = {
      _id: newConversation._id,
      friend: newConversation.participants.find(
        p => p._id.toString() !== senderID.toString()
      ),
      lastMessage: "",
      lastMessageSender: null,
      updatedAt: newConversation.updatedAt
    };

    const receiverFormatted = {
      _id: newConversation._id,
      friend: newConversation.participants.find(
        p => p._id.toString() !== receiverID.toString()
      ),
      lastMessage: "",
      lastMessageSender: null,
      updatedAt: newConversation.updatedAt
    };
    const recieverSocketId = users[receiverID.toString()];
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newFriend", receiverFormatted);
    }
    const senderSocketId = users[senderID.toString()];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newFriend", senderFormatted);
    }
    return res.status(201).json({ message: "Friend added" });
  } catch (err) {
    console.log(err);
    return res.status(409).json({ error: err });
  }
}

const sendMessage = async (req, res) => {
  const { receiverID, conversationId, message } = req.body;
  const image = req.file;
  const senderID = req.user._id;
  try {
    let conversation = await Conversation.findById(
   conversationId
);
    if (!conversation) {
      conversation = await Conversation.create({
        participants: participant
      });
    }
    let imageUrl = "";

    if (image) {
      const uploaded = await uploadOnCloudinary(image.path);
      imageUrl = uploaded?.secure_url || "";
    }
    const text = await Message.create({
      conversationId: conversation._id,
      sender: senderID,
      senderName: req.user.name,
      text: message || "",
      image: imageUrl,
       status: "sent"
    })
    conversation.lastMessage = imageUrl ? "📷 Photo" : message;
    conversation.lastMessageSender = senderID;
    conversation.unreadCount += 1;
    await conversation.save();
    const payload = {
      _id: text._id,
      sender: text.sender,
       senderName: text.senderName,
      text: text.text,
      image: text.image,
      conversationId: conversation._id,
      lastMessage: imageUrl ? "📷 Photo" : message,
      status: text.status
    };
    if (conversation.isGroup) {

   for (const member of conversation.participants) {

      if (
         member.toString() ===
         senderID.toString()
      ) continue;

      const socketId =
         users[member.toString()];

      if (socketId) {
         io.to(socketId)
           .emit("newMessage", payload);
      }
   }

} else {

   const recieverSocketId =
      users[receiverID.toString()];

   if (recieverSocketId) {
      io.to(recieverSocketId)
        .emit("newMessage", payload);
   }
}
    return res.status(201).json({ message: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
const getMessage = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ data: messages });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getConversations = async (req, res) => {
  const userId = req.user._id;

  try {

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "-password")
      .sort({ updatedAt: -1 });
   const formatted = conversations.map(conv => {

   if (conv.isGroup) {
      return {
         _id: conv._id,
         isGroup: true,
         groupName: conv.groupName,
         groupImage: conv.groupImage,
         participants: conv.participants,
         lastMessage: conv.lastMessage,
         unreadCount: conv.unreadCount,
         updatedAt: conv.updatedAt
      };
   }

   const friend = conv.participants.find(
      p => p._id.toString() !== userId.toString()
   );

   return {
      _id: conv._id,
      friend,
      isGroup: false,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount,
      updatedAt: conv.updatedAt
   };
});
    return res.status(200).json({ friends: formatted });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const resetUnread = async (req, res) => {
   const { conversationId } = req.body;

   try {

      await Conversation.findByIdAndUpdate(
         conversationId,
         { unreadCount: 0 }
      );

      return res.status(200).json({
         message: "Unread reset"
      });

   } catch (err) {
      return res.status(500).json({
         error: err.message
      });
   }
};
const createGroup = async (req, res) => {
    try {

        const { groupName, members } = req.body;

        if (!groupName) {
            return res.status(400).json({
                error: "Group name required"
            });
        }
        if (!members || members.length < 2) {
    return res.status(400).json({ error: "Minimum 2 members required" });
}

        const group = await Conversation.create({
            participants: [
                req.user._id,
                ...members
            ],
            isGroup: true,
            groupName,
            groupAdmin: req.user._id
        });

        return res.status(201).json({
            message: "Group created",
            group
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};
const deleteMessage = async (req, res) => {
  const { conversationId } = req.body;
  try {
    const person = await Message.find({ conversationId });
    if (person.length == 0) {
      return res.status(404).json({ error: "No messages found" })
    }
    await Message.deleteMany({ conversationId });
    const conversation = await Conversation.findById(conversationId);
    conversation.lastMessage = "";
    conversation.lastMessageSender = null;
    await conversation.save();
    return res.status(200).json({ message: "Messages deleted successfully" })
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
const deleteSingleMessage = async (req, res) => {
    try {

        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                error: "Message not found"
            });
        }

        if (
            message.sender.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                error: "Not authorized"
            });
        }

        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({
            message: "Message deleted"
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};
export { sendMessage, getMessage, getConversations, newFriend, deleteMessage, resetUnread, createGroup, deleteSingleMessage };