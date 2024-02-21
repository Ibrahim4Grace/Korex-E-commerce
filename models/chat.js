const mongoose = require(`mongoose`);
const msgSchema = new mongoose.Schema({

    message:{
        type: String, 
    },
    senderName: {
        type: String
    },
    senderRole: {
        type: String, 
    },
    userId: {
        type: mongoose.Schema.Types.Mixed, // Use the type ObjectId to store user _id
        ref: 'User', // Reference the User model
    },
    adminId: {
      type: mongoose.Schema.Types.Mixed,  // Allow both ObjectId and String
      ref: 'Admin',
    },
    date_added: {
        type: Date,
        default: Date.now()
    }


});

const Chat = mongoose.model('userChat', msgSchema);
module.exports =  Chat
