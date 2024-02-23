// Importing the necessary modules
const cron = require('node-cron'); // Importing the node-cron module for scheduling tasks
const User = require('../models/User'); // Assuming you have a User model defined somewhere

// Function to cleanup inactive users
async function cleanupInactiveUsers() {
    console.log('Cleanup task started.'); // Add this line to verify the function ca

    // Define the expiration time for inactive users in days
    // const expirationTimeInDays = 1; // Example: 1 day

    const expirationTimeInHours = 1; // Change expiration time to 1 hour

    // Calculate the threshold date by subtracting the expiration time from the current date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - expirationTimeInHours);

    console.log('Cleanup task started.'); // Log that cleanup task has started

    try {
        // Find inactive users based on criteria (e.g., not verified email within expiration time)
        const inactiveUsers = await User.find({
            isVerified: false, // Select users who are not verified
            date_added: { $lt: thresholdDate }// Select users with verification tokens created before the threshold date
        });
        
        // Log the number of inactive users found
        console.log(`Found ${inactiveUsers.length} inactive users.`);

        // // Delete inactive users
        // await Promise.all(inactiveUsers.map(user => user.remove()));

        if (inactiveUsers.length > 0) {
            // Delete inactive users
            await Promise.all(inactiveUsers.map(async (user) => {
                await user.remove();
                console.log(`Deleted user: ${user.customerEmail}`);
            }));
        } else {
            console.log('No inactive users to delete.');
        }

        // Log the number of deleted inactive users
         console.log(`Cleanup task completed. Deleted ${inactiveUsers.length} inactive users.`);
    } catch (error) {
        // Log any errors that occur during the cleanup process
        console.error('Error cleaning up inactive users:', error);
    }
}

// Export the cleanupInactiveUsers function for use in other modules
module.exports = cleanupInactiveUsers;




// server.js 
// //   // Schedule the cleanup task to run every day at midnight
// // cron.schedule('0 0 * * *', cleanupInactiveUsers);
// // Schedule the cleanup task to run every hour
// cron.schedule('0 * * * *', () => {
//     console.log('Running cleanup task...'); // Log that cleanup task is running
//     cleanupInactiveUsers();
//   });
//     // Call the cleanupInactiveUsers function
//     cleanupInactiveUsers();
    
  