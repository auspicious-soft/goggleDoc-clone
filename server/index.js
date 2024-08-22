import{Server} from 'socket.io';
import express from 'express';
import OpenAIApi from 'openai';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import { Mail } from './email/sendEmail.js';
import Connection from './database/db.js';
import { getDocument, updateDocument } from './controller/document-controller.js';
import { getComment, updateComment } from './controller/comment-controller.js';

const PORT = 9000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const server = http.createServer(app);
const quillData = '';

const io = new Server(server,{
    cors:{
        
        origin:"*",
        methods:['GET','POST']

    }

});

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  
  app.use(cors(corsOptions));

  const configuration = new OpenAIApi({
    apiKey: '',
  });

  const openai = new OpenAIApi(configuration);

  // Function to generate comments based on user preferences and contract text
    async function generateComments(contractText, userResponses) {
        const prompt = `
        Write the comments as if you are a practical contract lawyer, in a friendly but professional way. Comments should reflect negotiation techniques, suggestions to balance the clauses where necessary, suggestions for improvements in the contract clauses, suggestions to make deadlines/timelines/obligations more reasonable, clarification suggestions, appropriate responses to the comments of counteragents/internal comments, etc. When the comment pertains to specific words, phrases, or sentences, mention them (not highlight, just mention them) before commenting. Keep the comments as short as possible without compromising substance, accuracy, completeness, clarity, or compliance.
    
        User Preferences:
        - Do you prefer detailed comments or brief notes? ${userResponses.briefOrDetailed}
        - Should the comments focus on strict legal accuracy or practical implications? ${userResponses.accuracyOrPractical}
        - Are there any specific sections you want more detailed feedback on? ${userResponses.specificSections}
        - Do you have any style preferences for the comments (e.g., formal, casual)? ${userResponses.stylePreference}
        - Do you want comments on formatting and structure as well as content? ${userResponses.formattingStructure}
        - Do you have any additional requests? ${userResponses.additionalRequests}
    
        Contract Text:
        ${contractText} `;

        try {
            const response = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: "The system shouldn't answer its own comments. It only needs to write comments. When there are existing comments from others, the AI should respond to those as a practical contract lawyer.",
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            });           

            return response.choices[0].message.content.trim();
            
        } catch (error) {
        console.error('Error communicating with OpenAI API:', error);
        return 'Error generating comments';
        }
    }

    // Endpoint to generate comments
    app.post('/generate-comments', async (req, res) => {
        const { documentId, userResponses } = req.body;   
        const document = await getDocument(documentId);
        var contractText = '';
        var comments = '';
        for(var i=0;i<document.data.ops.length;i++)
        {
          const text = '\n'+ document.data.ops[i].insert;
          contractText = contractText + text;          
        }
        comments = await generateComments(contractText, userResponses);    
        
        var comment = await updateComment(documentId, { comments });
        
        res.json({ comments });      
    });

  app.post('/send-email', async (req, res) => {

    
    const { email , link} = req.body;
    const to  = email;
    const link1 = link;
    const text = 'Hello';
    const subject = 'Shared Document link - Contractee';
    const html = `<h4 style="font-size: 30px;  line-height: 36px; margin:20px 0 ;  font-weight: 700;">Click <a href="${link1}">here</a> to open the document.</h4>`;
       
    try {
      await Mail(to, subject, text, html);
      res.status(200).send('Email sent successfully');
    } catch (error) {
      res.status(500).send('Error sending email');
    }
});

io.on('connection',socket => {
    
    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);
        socket.on('send-changes', delta => {
          socket.broadcast.to(documentId).emit('receive-changes', delta);           
        });

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);            
        });
    });       


    socket.on('get-comment', async documentId => {
      const comment = await getComment(documentId);
      socket.join(documentId);
      socket.emit('load-comment', comment.data);      
    });       
     
});

server.listen(9000, () => {
    console.log('Server is running on port 9000');
});