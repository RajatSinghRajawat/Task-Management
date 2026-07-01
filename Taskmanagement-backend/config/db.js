const mongoose = require("mongoose");
const dns = require("dns");

// Programmatic fallback to Google & Cloudflare DNS to resolve Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("DNS lookup overridden to ['8.8.8.8', '1.1.1.1'] for MongoDB SRV resolution");
} catch (e) {
    console.warn("Failed to configure custom DNS servers programmatically:", e.message);
}

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed:");
        console.error(error);
        if (error.message && (error.message.includes("querySrv ECONNREFUSED") || error.message.includes("buffering timed out"))) {
            console.warn("\n======================================================================");
            console.warn("⚠️  DIAGNOSTIC WARNING: MongoDB Connection / DNS Resolution Error!");
            console.warn("It looks like your network or ISP DNS server is unable to resolve the");
            console.warn("MongoDB Atlas SRV record ('querySrv ECONNREFUSED').");
            console.warn("To resolve this issue:");
            console.warn("1. Change your local machine's DNS servers to Google DNS (8.8.8.8 and 8.8.4.4)");
            console.warn("   or Cloudflare DNS (1.1.1.1).");
            console.warn("2. Make sure MongoDB Atlas has whitelisted your current IP address.");
            console.warn("3. Check if your corporate or local firewall is blocking outbound port 27017.");
            console.warn("======================================================================\n");
        }
    }
};

module.exports = connectDB;

