## Overview



# Gmail Auto Reply Node.js Application

## Overview

This Gmail-auto-reply App is a Node.js application, that demonstrates how to create an auto-reply system for Gmail using the Gmail API. The application uses the Gmail API to fetch unread messages and send automatic replies based on predefined rules. It is designed to automate email responses during a user's unavailability. The app checks for new emails, sends replies to threads with no prior responses, and adds a label to the email threads. The application repeats this sequence at random intervals to simulate natural responses.

## Prerequisites

Before running the application, make sure you have the following:

- Node.js installed on your machine
- Gmail API credentials (client_secret.json)
- Node.js packages installed (`npm install`)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/gmail-auto-reply-nodejs.git
    cd gmail-auto-reply-nodejs
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up Gmail API credentials:

    - Visit the [Google Cloud Console](https://console.developers.google.com/)
    - Create a new project and enable the Gmail API
    - Create credentials and download the `client_secret.json` file
    - Place the `client_secret.json` file in the root directory of the project

## Configuration

1. Open `credentials.json` file and update the following:

    ```javascript
    {
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      redirectUri: 'YOUR_REDIRECT_URI',
    };
    ```

## Usage

Run the application using:

```bash
node index.js
