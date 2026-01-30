# 🤖 AI Resume Builder

An intelligent resume customization tool powered by Gen-AI that helps you tailor your resume to match specific job descriptions. Features a chatbot interface for interactive resume editing and real-time preview.

## ✨ Features

- **AI-Powered Customization**: Automatically adjust your resume based on job descriptions
- **Interactive Chatbot**: Ask questions and get suggestions for improving your resume
- **Real-time Preview**: See changes to your resume instantly
- **Job Description Analysis**: AI analyzes job postings to identify key skills and requirements
- **Smart Suggestions**: Get specific recommendations for bullet points, skills, and summaries
- **Modern UI**: Clean, responsive interface with split-view design

## 🏗️ Project Structure

```
CvBuilder/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatInterface.jsx       # Chat UI
│   │   │   ├── ResumePreview.jsx      # Resume display
│   │   │   └── JobDescriptionInput.jsx # Job input
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.js      # Chat API routes
│   │   └── server.js        # Express server
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/jijo125s/Projects/CvBuilder
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   PORT=5000
   ```

### Running the Application

You need to run both the backend and frontend servers:

1. **Start the Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 📖 How to Use

1. **Paste Job Description**: Click on "Job Description" section and paste the job posting you're targeting

2. **Chat with AI**: Use the chat interface to:
   - Ask for resume improvement suggestions
   - Request specific section rewrites
   - Get advice on highlighting relevant skills
   - Ask questions about tailoring your resume

3. **Review Changes**: Watch your resume update in real-time on the right panel

4. **Iterate**: Continue refining your resume through conversation with the AI

### Example Prompts

- "Can you help me tailor my resume for this job?"
- "Rewrite my professional summary to match this role"
- "What skills should I emphasize for this position?"
- "Make my experience bullet points more relevant to this job"
- "Add the missing skills that the job requires"

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **OpenAI API** - AI/GPT integration
- **dotenv** - Environment variable management

## 🔑 API Configuration

This project uses OpenAI's GPT-4 Turbo model. To get started:

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add it to your `.env` file in the backend folder
4. Ensure you have credits in your OpenAI account

**Note**: Using the OpenAI API incurs costs. Monitor your usage at the [OpenAI dashboard](https://platform.openai.com/usage).

## 🎯 Learning Objectives

This project is designed to help you learn:

1. **Gen-AI Integration**: How to integrate GPT models into applications
2. **Prompt Engineering**: Crafting effective system prompts for specific tasks
3. **Full-Stack Development**: Building React frontend with Node.js backend
4. **API Design**: Creating RESTful APIs for AI interactions
5. **State Management**: Managing complex application state in React
6. **Real-time UX**: Building responsive, interactive user interfaces

## 🔄 How It Works

1. **User Input**: User provides base resume data and job description
2. **Context Building**: System prompt combines resume data and job requirements
3. **AI Processing**: OpenAI analyzes and provides tailored suggestions
4. **Interactive Refinement**: User can ask follow-up questions via chat
5. **Live Updates**: Resume preview updates as changes are suggested

## 🚧 Future Enhancements

- [ ] PDF export functionality
- [ ] Multiple resume templates
- [ ] Resume upload (PDF/DOCX parsing)
- [ ] ATS (Applicant Tracking System) optimization scoring
- [ ] Save/load resume versions
- [ ] User authentication
- [ ] Database integration for storing resumes
- [ ] Support for multiple AI models (Claude, Gemini, etc.)
- [ ] Batch processing for multiple job applications

## 📝 Development Tips

### Frontend Development
- Components are in `frontend/src/components/`
- Modify `App.jsx` to change overall layout
- TailwindCSS classes are used for styling
- State management is handled with React hooks

### Backend Development
- API routes are in `backend/src/routes/`
- Modify system prompt in `chat.js` to change AI behavior
- Add new routes by creating files in `routes/` folder

### Customizing AI Behavior
Edit the `buildSystemPrompt()` function in `backend/src/routes/chat.js` to:
- Change the AI's personality
- Add specific instructions
- Include industry-specific guidance
- Adjust the level of detail in suggestions

## 🐛 Troubleshooting

**Frontend won't start**
- Ensure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again

**Backend API errors**
- Check if `.env` file exists with valid `OPENAI_API_KEY`
- Verify OpenAI API key is active and has credits
- Check console for specific error messages

**CORS errors**
- Ensure backend is running on port 5000
- Check Vite proxy configuration in `vite.config.js`

**AI responses are slow**
- This is normal - GPT-4 Turbo can take 5-15 seconds
- Consider using GPT-3.5-turbo for faster responses (edit model in `chat.js`)

## 📄 License

MIT License - feel free to use this project for learning and personal use.

## 🤝 Contributing

This is a learning project! Feel free to:
- Add new features
- Improve the UI/UX
- Enhance the AI prompts
- Add more resume templates
- Share your improvements

## 📬 Support

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Review the OpenAI API documentation
3. Check the console for error messages

---

**Happy Resume Building! 🎉**

Learn Gen-AI by building something practical and useful!
