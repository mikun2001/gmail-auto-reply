// app.js
import express from "express";
import authenticate from "./auth";
import { checkForNewEmails, sendReply } from "./gmail";
import { config } from "dotenv";

config();
const app = express();
const PORT = process.env.PORT || 3000;

let lastRepliedThreadId;

async function main() {
	//authenticate with google(Oauth 2.0)
	const auth = await authenticate();
	// console.log("auth is successfull ------->>>>>>", auth);

	// Check for new emails
	const unreadEmails = await checkForNewEmails(auth);

	// Process unread emails
	// console.log("unreadEmails---->", unreadEmails);
	for (const email of unreadEmails) {
		const threadId = email.threadId;

		// Check if the email thread has been replied to
		if (threadId !== lastRepliedThreadId) {
			// Send a reply
			await sendReply(auth, email.from, threadId);

			// Update lastRepliedThreadId to avoid double replies
			lastRepliedThreadId = threadId;
		}
	}
}

// Implement the main interval loop
setInterval(async () => {
	try {
		await main();
	} catch (error) {
		console.error("Error in main loop:", error);
	}
}, getRandomInterval());

function getRandomInterval() {
	return Math.floor(Math.random() * (120000 - 45000 + 1) + 45000); // Random interval between 45 and 120 seconds
}

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});