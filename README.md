# XMPP-Project
Instant messaging client that implements the XMPP protocol. This project aims to provide a user-friendly messaging experience. With support for real-time messaging, presence detection, and file sharing, it allows users to communicate seamlessly across different platforms.


## Technologies
- React
- XMPP


## Features
Here are some key features of this XMPP project:

### Account Settings
- Register a new account.
- Log in and log out.
- Delete accounts.
- Manage your own staus and presence message.

### Chatting
- Send and receive messages instantly.
- See all your contacts, add new contacts or delete them.
- Know when your contacts are online, offline, or away.
- Easily share txt files with your contacts.

### Group Chatting
- Send and receive messages in a group chat.
- Create a new group chat.
- Add people to the group chat.
- Get out of a group chat.


## How to run

### Prerequisites
Ensure that you have the following installed:
- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)

### Dependencies
Using npm:

```bash
npm install
```

### Run Application
In the project directory, you can run:

```bash
npm start
```
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


## Project Structure
The project is structured as follows:

```plaintext
.
├── public/
├── src/
│   ├── components/                 # React components
|   │    ├── Chatbox/
|   │    │    ├── ChatHeader
|   │    │    ├── MessageInput
|   │    │    └── MessageList
|   │    ├── CreateGroupModal
|   │    ├── GroupInviteModal
|   │    ├── InviteToGroupModal
|   │    ├── MainPage
|   │    ├── PresenceRequestModal
|   │    ├── SidebarLeft/
|   │    │    ├── AddContactModal
|   │    │    ├── ContactInfoModal
|   │    │    ├── GroupInfoModal
|   │    │    └── NonContactList
|   │    ├── SidebarRight
|   │    └── SignIn/
|   │        └── SignUpModal
│   ├── App.js                      # Main App
│   ├── App.css                     # Main App styles
│   ├── App.test.js                 # Main App tests (not implemented)
│   ├── index.js                    # Entry point
│   ├── index.css                   # Entry point styles
│   ├── setupTests.js               # Tests (not implemented)
│   ├── reportWebVitals.js          # Web Vitals (not implemented)
│   └── xmppClient.js               # XMPP client
├── package.json                    # Project metadata
├── package-lock.json               # Project dependencies
└── README.md                       # Project documentation
```