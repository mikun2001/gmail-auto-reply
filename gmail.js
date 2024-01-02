// gmail.js

import { google } from "googleapis";
import authenticate from "./auth";

export async function checkForNewEmails() {
	const auth = await authenticate();

	const gmail = google.gmail({ version: "v1", auth });

	// console.log('gmail----->>>', gmail);
	try {
		const response = await gmail.users.messages.list({
			userId: "me",
			q: "is:unread",
		});

		// console.log('response ------->', response);

		const messages = response.data.messages || [];
		const emails = [];

		for (const message of messages) {
			const email = await gmail.users.messages.get({
				userId: "me",
				id: message.id,
			});

			// console.log('email---->', email);

			emails.push({
				threadId: email.data.threadId,
				from: email.data.payload.headers.find(
					(header) => header.name === "From"
				).value,
				subject: email.data.payload.headers.find(
					(header) => header.name === "Subject"
				).value,
			});
		}

		return emails;
	} catch (error) {
		if (error.code === 401) {
			// Token expired, refresh and try again
			await refreshToken(auth);
			return checkForNewEmails(); // Retry the function after token refresh
		} else {
			throw error;
		}
	}
}

async function refreshToken(auth) {
	try {
		const newToken = await auth.refreshToken(process.env.REFRESH_TOKEN);
		auth.credentials = newToken.tokens;
		// Save the updated token to disk
		fs.writeFileSync("token.json", JSON.stringify(newToken.tokens));
	} catch (err) {
		console.error("Error refreshing token:", err.message);
	}
}

export async function createLabel(auth, labelName) {
	const gmail = google.gmail({ version: "v1", auth });
	const response = await gmail.users.labels.create({
		userId: "me",
		resource: { name: labelName },
	});
	return response.data;
}

async function addLabel(auth, threadId, labelName) {
	const gmail = google.gmail({ version: "v1", auth });

	try {
		// Check if the label exists, create it if not
		const labels = await listLabels(auth);
		let label = labels.find((label) => label.name === labelName);

		// console.log("label----->", label);
		if (!label) {
			label = await createLabel(auth, labelName);
		}

		// Add label to the email thread
		await gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: { addLabelIds: [label.id] },
		});
	} catch (error) {
		console.error("Error adding label:", error.message);
	}
}

export async function listLabels(auth) {
	const gmail = google.gmail({ version: "v1", auth });
	const response = await gmail.users.labels.list({
		userId: "me",
	});
	return response.data.labels;
}

export async function sendReply(auth, to, threadId) {
	const gmail = google.gmail({ version: "v1", auth });
	const email = await gmail.users.messages.send({
		userId: "me",
		requestBody: {
			raw: createEmail(
				to,
				"me",
				"Re: Task mail Reply from OpeninApp",
				"Thank you for your email!"
			),
		},
	});

	// Add label to the replied email
	await addLabel(auth, threadId, "Replied");

	return email.data;
}

export function createEmail(to, from, subject, body) {
	const str = [
		'Content-Type: text/plain; charset="UTF-8"\n',
		"MIME-Version: 1.0\n",
		`to: ${to}\n`,
		`from: ${from}\n`,
		`subject: ${subject}\n\n`,
		`${body}\n`,
	].join("");
	return Buffer.from(str)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
