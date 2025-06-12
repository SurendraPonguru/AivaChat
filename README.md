# AivaChat ✨

** AI Virtual Assistant**

AivaChat is a modern, responsive chatbot application powered by the Google Gemini API. Built with React, TypeScript, and Tailwind CSS, it offers a seamless and engaging conversational experience. Users can interact with an advanced AI model, enjoy real-time message streaming, and benefit from persistent chat history.

## Table of Contents

- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [API Key Configuration](#api-key-configuration)
  - [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [Folder Structure](#folder-structure)
- [UI/UX Design](#uiux-design)
- [Offline Functionality](#offline-functionality)
- [Accessibility](#accessibility)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Real-time AI Conversations:** Utilizes the Gemini API for intelligent and streamed responses.
- **Persistent Chat History:** Saves and retrieves chat sessions from the browser's local storage.
- **Multiple Chat Management:** Create, select, and delete multiple chat sessions.
- **Automatic Chat Titling:** Chat titles are intelligently generated from the first user message or a timestamp if no user message exists.
- **Responsive Design:** Optimized for a seamless experience across desktop, tablet, and mobile devices.
- **Modern UI/UX:** A clean, intuitive, and visually appealing interface styled with Tailwind CSS.
- **Loading States & Feedback:** Clear indicators for message sending, AI thinking, and page loading.
- **Toast Notifications:** Non-intrusive alerts for errors, successes, and informational messages.
- **Typing Indicators:** Visual cue when Aiva is generating a response.
- **Markdown & Link Support:** Basic Markdown rendering (newlines) and automatic detection of clickable links in messages.
- **Secure API Key Handling:** API key is managed exclusively through environment variables, ensuring it's not exposed in the frontend code.
- **Error Handling:** Graceful management of API errors and other potential issues.
- **Initial Welcome Message:** Friendly greeting from Aiva in new chats.
- **Dynamic Content Placeholder:** Informative placeholder in the chat window when no messages are present or when a new chat is initiated.

## Technologies Used

- **Frontend Framework:** React 19 (using Hooks)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Custom CSS (for initial loader, scrollbars)
- **AI Integration:** Google Gemini API (`@google/genai` SDK)
- **State Management:** React Context API (implicitly through component state and prop drilling)
- **Local Storage:** For chat history persistence.
- **Module Bundling/Resolution:** ES Modules with import maps (as seen in `index.html`)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- A modern web browser that supports ES Modules and Local Storage.
- An active Google Gemini API key.

### Installation

1.  **Clone the repository (if applicable) or download the files.**
    ```bash
    # If it's a git repository
    git clone <repository-url>
    cd aivachat
    ```
    If you have the files directly, simply place them in a project folder.

2.  **API Key Configuration (Crucial!)**

    The AivaChat application **requires** a Google Gemini API key to function. This key **must** be provided as an environment variable named `API_KEY`.

    -   **How it's used:** The application code (`App.tsx`) attempts to read this key using `process.env.API_KEY`.
    -   **Execution Environment:** Your development server or hosting environment **must** be configured to make this environment variable available to the JavaScript context at runtime.
        -   For local development with tools like Vite or Create React App (if you adapt the project to use them), you would typically create a `.env` file in the project root:
            ```env
            API_KEY=YOUR_GEMINI_API_KEY_HERE
            ```
        -   If serving `index.html` directly with a simple HTTP server, that server or an intermediate script might need to inject this variable.

    ⚠️ **Important Security Note:**
    *   **Never** hardcode your API key directly into `index.html`, `index.tsx`, `App.tsx`, or any other frontend file.
    *   The application is designed to **exclusively** use `process.env.API_KEY`. Do not modify the code to accept the API key via UI input or any other insecure method.
    *   Ensure your `.env` file (if used) is included in your `.gitignore` to prevent committing sensitive keys.

## Folder Structure

```
/
├── components/                  # UI Components
│   ├── icons/                   # SVG Icon Components
│   │   ├── AivaLogo.tsx
│   │   ├── BotIcon.tsx
│   │   ├── ChatPlaceholderIcon.tsx
│   │   ├── ErrorIcon.tsx
│   │   ├── PlusIcon.tsx
│   │   ├── SendIcon.tsx
│   │   ├── TrashIcon.tsx
│   │   └── UserIcon.tsx
│   ├── ChatWindow.tsx           # Displays chat messages
│   ├── MessageBubble.tsx        # Individual message bubble
│   ├── MessageInput.tsx         # Text input area for sending messages
│   ├── PageLoader.tsx           # Full-page loader for initial app load
│   ├── Sidebar.tsx              # Navigation sidebar for chats
│   ├── Spinner.tsx              # Generic spinner component
│   └── Toast.tsx                # Notification messages
├── utils/                       # Utility functions
│   └── chatHistory.ts           # Functions for managing chat history in local storage
├── App.tsx                      # Main application component, manages state and logic
├── index.html                   # Main HTML file
├── index.tsx                    # React entry point, renders App
├── metadata.json                # Application metadata
├── types.ts                     # TypeScript type definitions
└── README.md                    # This file
```

## UI/UX Design

-   **Clean and Modern:** Aesthetically pleasing interface with a focus on usability.
-   **Responsive:** Adapts gracefully to different screen sizes.
-   **Intuitive Navigation:** Easy-to-use sidebar for managing multiple chat sessions.
-   **Clear Feedback:** Visual cues for loading, sending, and AI responses.
-   **Accessibility:** ARIA attributes are used to improve accessibility (e.g., `aria-label`, `aria-live`).
-   **Branding:** Consistent use of "AivaChat ✨" and the AivaLogo.
-   **Tailwind CSS:** Leverages utility-first CSS for rapid UI development and consistency.

## Offline Functionality

-   Chat history is stored in Local Storage, making past conversations accessible even if the user goes offline and reloads the app.
-   New messages cannot be sent or received from the AI while offline.

## Accessibility

The application aims to be accessible:
-   Semantic HTML elements are used where appropriate.
-   ARIA attributes (e.g., `aria-label`, `aria-live`, `aria-current`, `role="button"`) are implemented for interactive elements and dynamic content updates.
-   Focus management is considered, for example, in the sidebar and message input.
-   Keyboard navigation is supported for interactive elements like buttons and chat selection.

## Contributing

Contributions are welcome! If you have suggestions or want to improve AivaChat, please feel free to:
1.  Fork the repository (if applicable).
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code follows the existing style and an API key is not committed.

## Contact
Feel free to connect with me:
- Portifolio : [portifolio/surendraponguru](https://surendra-portfolio-three.vercel.app/)
- GitHub: [github.com/surendraponguru](https://github.com/surendraponguru)
- LinkedIn: [linkedin.com/in/surendra-ponguru](https://linkedin.com/in/surendra-ponguru)
- Email: ponguru720@gmail.com

## License

<!-- This project is licensed under the MIT License - see the LICENSE file for details (if one is created).
Alternatively, if no LICENSE file is present: -->
<!-- &copy; {new Date().getFullYear()} AivaChat.  -->
© 2025 Surendra Ponguru. All rights reserved.
```

