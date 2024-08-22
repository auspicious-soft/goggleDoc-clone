import React, { useState } from "react";
import { Comment } from "@mui/icons-material";
import axios from "axios";
import { GENERATECOMMETS } from "../Helpers/ApiUrl";

export default function Comments({ onCommentsSubmit, onCommentsClick,showForm,setShowForm }) {
  const currentUrl = window.location.href;
  const [showPopup, setShowPopup] = useState(false);
  const [responses, setResponses] = useState({
    detailedComments: "",
    legalAccuracy: "",
    sectionsFeedback: "",
    stylePreferences: "",
    otherComments: "",
    formatStructure: "",
    additionalRequests: "",
  });
  const [showOtherTextarea, setShowOtherTextarea] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const urlObj = new URL(currentUrl);
  const pathname = urlObj.pathname;
  const documentId = pathname.split("/").pop();

  const handleCommentsClick = () => {
    resetForm();
    setShowPopup(true);
    if (onCommentsClick) onCommentsClick();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowForm(false);
  };

  const resetForm = () => {
    setResponses({
      detailedComments: "",
      legalAccuracy: "",
      sectionsFeedback: "",
      stylePreferences: "",
      otherComments: "",
      formatStructure: "",
      additionalRequests: "",
    });
    setShowOtherTextarea(false);
    setValidationErrors({});
  };

  const validateResponses = () => {
    const errors = {};
    if (!responses.detailedComments)
      errors.detailedComments = "Please select an option for Q1.";
    if (!responses.legalAccuracy)
      errors.legalAccuracy = "Please select an option for Q2.";
    if (!responses.sectionsFeedback && responses.sectionsFeedback !== "Skip")
      errors.sectionsFeedback = "Please provide an answer for Q3.";
    if (!responses.stylePreferences)
      errors.stylePreferences = "Please select an option for Q4.";
    if (!responses.formatStructure)
      errors.formatStructure = "Please select an option for Q5.";
    if (
      !responses.additionalRequests &&
      responses.additionalRequests !== "Skip"
    )
      errors.additionalRequests = "Please provide an answer for Q6.";
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateResponses();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    

    const data = {
      documentId: documentId,
      userResponses: {
        briefOrDetailed: responses.detailedComments,
        accuracyOrPractical: responses.legalAccuracy,
        specificSections: responses.sectionsFeedback,
        stylePreference: responses.stylePreferences,
        otherComments: responses.otherComments,
        formattingStructure: responses.formatStructure,
      },
    };

    axios
      .post(GENERATECOMMETS, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        localStorage.removeItem("response");
        localStorage.setItem(
          "response",
          JSON.stringify(response.data?.comments)
        );
        onCommentsSubmit(response.data?.comments);
        setShowPopup(false);
        setShowForm(false);
      })
      .catch((error) => {
        console.error(error);
        setShowPopup(false);
        setShowForm(false);
      });
  };

  const handleRadioChange = (question, value) => {
    setResponses((prevState) => ({
      ...prevState,
      [question]: value,
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [question]: "",
    }));

    if (question === "stylePreferences" && value === "Other") {
      setShowOtherTextarea(true);
    } else if (question === "stylePreferences") {
      setShowOtherTextarea(false);
      setResponses((prevState) => ({
        ...prevState,
        otherComments: "",
      }));
    }
  };

  const handleTextAreaChange = (question, value) => {
    setResponses((prevState) => ({
      ...prevState,
      [question]: value,
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [question]: "",
    }));
  };

  return (
    <>
      <button
        className="bg-[#c2e7ff] flex gap-[8px] items-center text-[14px] font-[500] border-0 rounded-full px-6 py-[9.5px] "
        onClick={handleCommentsClick}
      >
        <Comment style={{ fontSize: 18 }} /> Comments
      </button>
      {(showPopup||showForm) && (
        <div className="fixed z-[10] p-2 flex justify-end bottom-0 right-[0px] h-[85vh] max-w-[510px] w-[96%] overflow-hidden">
          <div className="bg-white p-0 rounded-lg shadow-lg max-w-[500px] w-full relative h-[100%] overflow-auto">
            <h2 className="text-lg font-semibold bg-[#c2e7ff] p-3 sticky top-0 z-[2]">
              Comment
            </h2>
            <form className="label-size p-5 relative h-[calc(100%-52px)] flex justify-between flex-col">
              <div className="flex flex-col">
                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 1: Do you prefer detailed comments or brief notes?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Detailed Comments"
                        checked={
                          responses.detailedComments === "Detailed Comments"
                        }
                        name="briefOrDetailed"
                        onChange={() =>
                          handleRadioChange(
                            "detailedComments",
                            "Detailed Comments"
                          )
                        }
                      />
                      <span className="ml-2">Detailed Comments</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Brief notes"
                        checked={responses.detailedComments === "Brief notes"}
                        name="briefOrDetailed"
                        onChange={() =>
                          handleRadioChange("detailedComments", "Brief notes")
                        }
                      />
                      <span className="ml-2">Brief notes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.detailedComments === "Skip"}
                        name="briefOrDetailed"
                        onChange={() =>
                          handleRadioChange("detailedComments", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {validationErrors.detailedComments && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.detailedComments}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 2: Should the comments focus on strict legal accuracy or
                    practical implications?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Legal Accuracy"
                        checked={responses.legalAccuracy === "Legal Accuracy"}
                        name="accuracyOrPractical"
                        onChange={() =>
                          handleRadioChange("legalAccuracy", "Legal Accuracy")
                        }
                      />
                      <span className="ml-2">Legal Accuracy</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Practical implications"
                        checked={
                          responses.legalAccuracy === "Practical implications"
                        }
                        name="accuracyOrPractical"
                        onChange={() =>
                          handleRadioChange(
                            "legalAccuracy",
                            "Practical implications"
                          )
                        }
                      />
                      <span className="ml-2">Practical implications</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.legalAccuracy === "Skip"}
                        name="accuracyOrPractical"
                        onChange={() =>
                          handleRadioChange("legalAccuracy", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {validationErrors.legalAccuracy && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.legalAccuracy}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 3: Are there any specific sections you want more detailed
                    feedback on?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <textarea
                      id="specificSections"
                      name="sectionsFeedback"
                      rows="2"
                      cols="50"
                      className="border rounded p-2 w-full"
                      value={responses.sectionsFeedback}
                      onChange={(e) =>
                        handleTextAreaChange("sectionsFeedback", e.target.value)
                      }
                      disabled={responses.sectionsFeedback === "Skip"}
                    />
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.sectionsFeedback === "Skip"}
                        name="sectionsFeedback"
                        onChange={() =>
                          handleRadioChange("sectionsFeedback", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {validationErrors.sectionsFeedback && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.sectionsFeedback}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 4: Do you have any style preferences for the comments
                    (e.g., formal, casual)?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Formal"
                        checked={responses.stylePreferences === "Formal"}
                        name="stylePreference"
                        onChange={() =>
                          handleRadioChange("stylePreferences", "Formal")
                        }
                      />
                      <span className="ml-2">Formal</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Casual"
                        checked={responses.stylePreferences === "Casual"}
                        name="stylePreference"
                        onChange={() =>
                          handleRadioChange("stylePreferences", "Casual")
                        }
                      />
                      <span className="ml-2">Casual</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Other"
                        checked={responses.stylePreferences === "Other"}
                        name="stylePreference"
                        onChange={() =>
                          handleRadioChange("stylePreferences", "Other")
                        }
                      />
                      <span className="ml-2">Other</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.stylePreferences === "Skip"}
                        name="stylePreference"
                        onChange={() =>
                          handleRadioChange("stylePreferences", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {showOtherTextarea && (
                    <textarea
                      id="otherComments"
                      name="otherComments"
                      rows="2"
                      cols="50"
                      className="border rounded p-2 w-full mt-2"
                      value={responses.otherComments}
                      onChange={(e) =>
                        handleTextAreaChange("otherComments", e.target.value)
                      }
                    />
                  )}
                  {validationErrors.stylePreferences && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.stylePreferences}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 5: Do you want comments on formatting and structure as
                    well as content?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Formatting and Structure"
                        checked={
                          responses.formatStructure ===
                          "Formatting and Structure"
                        }
                        name="formattingStructure"
                        onChange={() =>
                          handleRadioChange(
                            "formatStructure",
                            "Formatting and Structure"
                          )
                        }
                      />
                      <span className="ml-2">Formatting and Structure</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Content only"
                        checked={responses.formatStructure === "Content only"}
                        name="formattingStructure"
                        onChange={() =>
                          handleRadioChange("formatStructure", "Content only")
                        }
                      />
                      <span className="ml-2">Content only</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.formatStructure === "Skip"}
                        name="formattingStructure"
                        onChange={() =>
                          handleRadioChange("formatStructure", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {validationErrors.formatStructure && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.formatStructure}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[15px] font-semibold mb-2">
                    Q 6: Do you have any additional requests?
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <textarea
                      id="additionalRequests"
                      name="additionalRequests"
                      rows="2"
                      cols="50"
                      className="border rounded p-2 w-full"
                      value={responses.additionalRequests}
                      onChange={(e) =>
                        handleTextAreaChange(
                          "additionalRequests",
                          e.target.value
                        )
                      }
                      disabled={responses.additionalRequests === "Skip"}
                    />
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Skip"
                        checked={responses.additionalRequests === "Skip"}
                        name="additionalRequests"
                        onChange={() =>
                          handleRadioChange("additionalRequests", "Skip")
                        }
                      />
                      <span className="ml-2">Skip</span>
                    </label>
                  </div>
                  {validationErrors.additionalRequests && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {validationErrors.additionalRequests}
                    </p>
                  )}
                </div>
              </div>

              <div className="sticky bg-white pt-[10px] flex gap-2 bottom-0 left-0 w-full z-[2]">
                <button
                  type="button"
                  className="bg-[#c2e7ff] text-[#000] rounded-full px-6 py-[10px] text-[16px] w-full mb-3"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="bg-[#fff] text-[#000] rounded-full px-6 py-[10px] text-[16px] w-full mb-3 border border-solid border-[#999]"
                  onClick={handleClosePopup}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
