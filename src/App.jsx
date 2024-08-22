import TextEditor from "./Components/TextEditor";
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import {v4 as uuid} from 'uuid';
// import EditorPage from "./EditorPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = { <Navigate replace to={`/docs/${uuid()}` }/> }> </Route>
        <Route path="/docs/:id" element = {<TextEditor />}></Route> 
      </Routes>
    </Router>
  );
}

export default App;
