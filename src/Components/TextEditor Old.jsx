import { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import { io } from "socket.io-client";
import "react-quill/dist/quill.snow.css"; // Import the styles
import { useParams } from "react-router-dom";
import SharePopup from "./SharePopup";
import { HttpsOutlined, FileCopyOutlined, Close, Feedback, InsertDriveFile } from "@mui/icons-material";
import CommentsButton from "./CommentsButton";
import Tooltip from "@mui/material/Tooltip";
import mammoth from "mammoth";

Quill.register("modules/imageResize", ImageResize);

const Font = Quill.import("formats/font");
Font.whitelist = [
  "SharpSansMediumItalic",
  "SharpSansExtrabold",
  "SharpSansBold",
  "AcuminProCondBookItalic",
  "HelveticaNeueCondensedBlack",
  "ABCReproRegular",
];
Quill.register(Font, true);

const Header = Quill.import("formats/header");
Quill.register(Header, true);

const Parchment = Quill.import("parchment");

const lineHeightConfig = {
  scope: Parchment.Scope.INLINE,
  whitelist: [
    '1.0', '1.2', '1.5', '1.6', '1.8', '2.0', '2.4', '2.8', '3.0', '4.0', '5.0'
  ]
};
const lineHeightClass = new Parchment.Attributor.Class('lineheight', 'ql-line-height', lineHeightConfig);
const lineHeightStyle = new Parchment.Attributor.Style('lineheight', 'line-height', lineHeightConfig);
Parchment.register(lineHeightClass);
Parchment.register(lineHeightStyle);

function TextEditor() {
  const [value, setValue] = useState("");
  const [socket, setSocket] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const { id } = useParams();
  const quillRef = useRef(null);

  const [comments, setComments] = useState(""); // State for comments
  const [tooltipOpen, setTooltipOpen] = useState(false); // State for tooltip
  const [commentsVisible, setCommentsVisible] = useState(false); // State to manage comments-section visibility

  const popupOpen = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCommentsSubmit = (comments) => {
    setComments(comments);
    setCommentsVisible(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setTooltipOpen(true);
        setTimeout(() => {
          setTooltipOpen(false);
        }, 2000); // Hide tooltip after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    if (showPopup) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showPopup]);

 const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Handle .docx files using mammoth
        const reader = new FileReader();
        reader.onload = (event) => {
          mammoth.convertToHtml({ arrayBuffer: event.target.result })
            .then((result) => {
              const existingContent = quillRef.current.getEditor().root.innerHTML;
              const newContent = result.value;
              quillRef.current.getEditor().root.innerHTML = existingContent + newContent;
              quillRef.current.getEditor().setSelection(quillRef.current.getEditor().getLength(), 0);
            })
            .catch((err) => {
              console.error("Error converting .docx to HTML: ", err);
            });
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Unsupported file type. Please upload a .docx file.");
      }
    }
  };
  
  

const modules = {
  toolbar: [
    [{ font: Font.whitelist }],
    [{ header: "1" }, { header: "2" }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ align: [] }, { color: [] }, { background: [] }],
    [{ 'lineheight': ['1', '1.2', '1.5', '1.6', '1.8', '2.0', '2.4', '2.8', '3.0', '4.0', '5.0'] }], // Updated line heights
    ["link", "image", "video"],
    ["clean"],
  ],
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
};

  const formats = [
    "font",
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "lineheight",
  ];

  const saveDocument = () => {
    localStorage.setItem("document", value);
  };

  useEffect(() => {
    const savedDocument = localStorage.getItem("document");
    if (savedDocument) {
      setValue(savedDocument);
    }
  }, []);

  useEffect(() => {
    const socketServer = io("http://localhost:9000");
    setSocket(socketServer);
    return () => {
      socketServer.disconnect();
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    if (socket === null || quill === null) return;
    const handleChange = (delta, oldData, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleChange);

    return () => {
      quill.off("text-change", handleChange);
    };
  }, [socket]);

  useEffect(() => {
    const quill = quillRef.current.getEditor();

    if (socket === null || quill === null) return;

    const handleChange = (delta) => {
      quill.updateContents(delta);
    };

    socket && socket.on("receive-changes", handleChange);

    return () => {
      socket && socket.off("receive-changes", handleChange);
    };
  }, [socket]);

  useEffect(() => {
    const quill = quillRef.current.getEditor();

    if (quill === null || socket === null) return;

    socket &&
      socket.once("load-document", (document) => {
        quill.setContents(document);
        quill.enable();
    });

    socket && socket.once("load-comment", (comment) => {
      console.log("Received comment:", comment);
      setComments(comment.comments); // Extracting the comments property
    }); 

    socket && socket.emit("get-document", id);
    socket && socket.emit("get-comment", id);
  }, [socket, id]);

  useEffect(() => {
    const quill = quillRef.current.getEditor();

    if (socket === null || quill === null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [socket]);

  // Convert newline characters to <br /> tags for comments
  const formatComments = (text) => {
    if (typeof text !== "string") {
      return "";
    }
    return text.replace(/\n\n/g, "<hr />");
  };
  useEffect(() => {
    const element = document.querySelector('.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="SharpSansMediumItalic"]::before');

    if (element) {
        const content = window.getComputedStyle(element, '::before').getPropertyValue('content');
        const trimmedContent = content.replace(/['"]+/g, '').substring(0, 4); // Remove quotes and trim to 4 letters
        element.style.setProperty('--content', `"${trimmedContent}"`);
    }
}, []);
  return (
    <div className="main-editor">
      <div className="flex justify-center gap-2 flex-wrap w-full mb-2 md:justify-end"> 
      <div className="bg-[#c2e7ff] flex gap-[8px] items-center text-[14px] font-[500] border-0 rounded-full px-6 py-[9.5px] relative cursor-pointer">
          <input type="file" onChange={handleDocumentUpload} className="absolute w-full h-[100%] z-[2] opacity-0 left-0 right-0 top-0 bottom-0 cursor-pointer" />
         <InsertDriveFile style={{ fontSize: 16 }} /> Upload Document
        </div>
          <button onClick={() => setCommentsVisible(true)} className="bg-[#c2e7ff] flex gap-[8px] items-center text-[14px] font-[500] border-0 rounded-full px-6 py-[9.5px]">
            <Feedback style={{ fontSize: 16 }}/>View Comments
          </button>
        <CommentsButton onCommentsSubmit={handleCommentsSubmit} />
        <button
          onClick={popupOpen}
          className="bg-[#c2e7ff] flex gap-[8px] items-center text-[14px] font-[500] border-0 rounded-full px-6 py-[9.5px]"
        >
          <HttpsOutlined style={{ fontSize: 18 }} /> Share
        </button>
      </div>
      <div className="flex gap-2">
        <div className="w-full">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={setValue}
            modules={modules}
            formats={formats}
          />
        </div>
        {commentsVisible &&  ( // Conditionally render comments-section if comments are present and commentsVisible is true
          <div className="comments-section min-w-[320px] max-w-[320px] w-full rounded-[24px] fixed z-8 right-[10px] md:relative md:right-0">
            <div className="flex justify-between items-center bg-[#c2e7ff] p-3 sticky top-0 z-[2] rounded-[24px] rounded-b-none gap-2">
              <h2 className="text-lg font-semibold">Comments</h2>
              <div className="flex gap-2">
              <Tooltip
                title="Comments copied to clipboard!"
                open={tooltipOpen}
                arrow
              >
                <span>
                  <button
                    onClick={() => copyToClipboard(comments)}
                    className="flex items-center gap-1 text-sm text-[#000000] border border-[#000000] px-1 py-1 rounded"
                  >
                    <FileCopyOutlined style={{ fontSize: 16 }} /> 
                  </button>
                </span> 
              </Tooltip>
              <button onClick={() => setCommentsVisible(false)} className="text-[10px] text-[#000000] border border-[#000000] px-1 py-1 rounded">
                <Close  style={{ fontSize: 16 }}/>
              </button>
              </div>
            </div>
            <div className="comments-data p-4 bg-white text-[14px]">
                {comments ? (
              <div dangerouslySetInnerHTML={{ __html: formatComments(comments) }} />
            ) : (
              "No comment found"
            )}
               </div>
          </div>
        )}
      </div>
      <SharePopup show={showPopup} onClose={handleClosePopup} />
    </div>
  );
}

export default TextEditor;
