// QuillContext.js
import React, { createContext, useState } from 'react';

export const QuillContext = createContext();

export const QuillProvider = ({ children }) => {
    const [quillContent, setQuillContent] = useState(null);

    return (
        <QuillContext.Provider value={{ quillContent, setQuillContent }}>
            {children}
        </QuillContext.Provider>
    );
};
