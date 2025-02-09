import React, { useState } from 'react';
import { FiFileText } from "react-icons/fi";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClaudeCollection() {
    const [formData, setFormData] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",

        referenceFile: null,
        wrongAnswer: "",
        gptStepsFile: null,
        referencedBy: "",
        subject: "",
        answerText: "",
        wrongAnswerText: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if subject is selected
        if (!formData.subject) {
            toast.warning('Please select a subject.',{
                style: { fontSize: "20px", padding: "16px", width: "450px" ,height:"100px"},
                autoClose: 5000,
            })
            //alert("Please select a subject.");
            return;
        }

        if (!formData.question.trim()) {
            toast.warning('Question field cannot be empty.',{
                style: { fontSize: "20px", padding: "16px", width: "450px" ,height:"100px"},
                autoClose: 5000,
            })
            // alert("Question field cannot be empty");
            return;
        }

        // Create an object with the data to send
        const dataToSend = {
            question: formData.question,
            options: formData.options,  // Send the entire options array
            correctAnswer: formData.correctAnswer,

            referenceFile: null,
            wrongAnswer: formData.wrongAnswer,
            gptStepsFile: null,
            referencedBy: formData.referencedBy,
            subject: formData.subject,
            answerText: formData.answerText,
            wrongAnswerText: formData.wrongAnswerText,
        };

        console.log("Form Data before submitting : ", dataToSend);

        try {
            const response = await fetch(`${import.meta.env.VITE_URL}/api/submit-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // Specify JSON content type
                },
                body: JSON.stringify(dataToSend)  // Convert data to JSON string
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Question successfully submitted!', {
                    style: { fontSize: "20px", padding: "16px", width: "450px" ,height:"100px"},

                autoClose: 5000,
                });
                // Optionally reset form
                setFormData({
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                    referenceFile: null,
                    wrongAnswer: "",
                    gptStepsFile: null,
                    referencedBy: "",
                    subject: "",
                    answerText: "",
                    wrongAnswerText: "",
                });
            } else {
                toast.error('Error submitting the question', {
                    style: { fontSize: "20px", padding: "16px", width: "450px" ,height:"100px"},

                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Error submitting the question:', error);
            toast.error('Error submitting the question', {
                style: { fontSize: "20px", padding: "16px", width: "450px" ,height:"100px"},

                autoClose: 5000,
            });
        }
    };


    const [validationMessages, setValidationMessages] = useState({
        question: "",
        correctAnswer: "",
        referenceText: "",
    }); 

    const subjects = ["Highway Engineering", "Structural Analysis", "Design of Steel Structures", "RCC"]


    const handleInputChange = (e, field, index = null) => {
        const value = e.target.value;
        setFormData((prevState) => {
            if (field === "options") {
                const updatedOptions = [...prevState.options];
                updatedOptions[index] = value;
                return { ...prevState, options: updatedOptions };
            }
            return { ...prevState, [field]: value };
        });
    };

    const validateQuestion = () => {
        let messages = { ...validationMessages };
        if (formData.question.trim().length < 5) {
            messages.question = "The question is too short. Please enter more details.";
        } else {
            messages.question = "The question is valid.";
        }
        setValidationMessages(messages);
    };

    const validateCorrectAnswer = () => {
        let messages = { ...validationMessages };
        if (formData.correctAnswer.trim() === "") {
            messages.correctAnswer = "The correct answer cannot be empty.";
        } else {
            messages.correctAnswer = "The correct answer is valid.";
        }
        setValidationMessages(messages);
    };

    const validateReference = () => {
        let messages = { ...validationMessages };
        if (formData.referenceText.trim() === "") {
            messages.referenceText = "The reference cannot be empty.";
        } else {
            messages.referenceText = "The reference is valid.";
        }
        setValidationMessages(messages);
    };

    const handleGenerateResponse = () => {

    }



    const renderValidationMessage = (message) => {
        if (message.includes("valid")) {
            return <p className="text-green-600 text-sm mt-1">{message}</p>;
        } else {
            return <p className="text-red-600 text-sm mt-1">{message}</p>;
        }
    };


    //file and s3 logic

    const [fileName, setFileName] = useState(null);
    const [isFileSelected, setIsFileSelected] = useState(false);

    const handleInputChangeforfile1 = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setIsFileSelected(true);
        }
    };

    const [fileName2, setFileName2] = useState(null);
    const [isFileSelected2, setIsFileSelected2] = useState(false);

    const handleInputChangeforfile2 = (e) => {
        if (e.target.files.length > 0) {
            setFileName2(e.target.files[0].name);
            setIsFileSelected2(true);
        }
    };


    return (
        <div className="h-full w-4/5 mx-auto bg-white shadow-slate-400 rounded-lg p-3 m-3">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Add New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Question Input */}
                <div className="flex gap-4 items-start">
                    {/* Question Input Section */}
                    <div className="shadow-slate-400 w-3/4">
                        <label className="block text-xl font-semibold mb-1">Question</label>
                        <textarea
                            value={formData.question}
                            onChange={(e) => handleInputChange(e, "question")}
                            placeholder="Enter your question"
                            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        <button
                            onClick={validateQuestion}
                            type="button"
                            className="mt-2 text-sm text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700"
                        >
                            Validate Question
                        </button>
                        {renderValidationMessage(validationMessages.question)}
                    </div>

                    {/* Subject Select Section */}
                    <div className="w-1/4">
                        <label className="block text-xl font-semibold mb-1">Subject</label>
                        
                        <select
                            value={formData.subject}
                            onChange={(e) => handleInputChange(e, "subject")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a Subject</option>
                            {subjects.map((subject, index) => (
                                <option key={index} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>


                {/* Options Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xl font-semibold ">Options</label>
                    </div>
                    {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleInputChange(e, "options", index)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>
                    ))}
                </div>

                {/* Correct Answer */}
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="text-xl font-semibold mb-1 block">Answer from Domain SME</label>
                        <input
                            type="text"
                            value={formData.correctAnswer}
                            onChange={(e) => handleInputChange(e, "correctAnswer")}
                            placeholder="Enter the correct answer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={validateCorrectAnswer}
                            type="button"
                            className="mt-2 text-sm text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700"
                        >
                            Validate Correct Answer
                        </button>
                        {renderValidationMessage(validationMessages.correctAnswer)}
                    </div>

                    <div className="flex-1">
                        <label className="text-xl font-semibold mb-1 block">Referenced by</label>
                        <input
                            type="text"
                            value={formData.referencedBy}
                            onChange={(e) => handleInputChange(e, "referencedBy")}
                            placeholder="Enter the reference"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>


                {/* Reference Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xl font-semibold  mb-1">Solution/Reference from Domain SME</label>
                        <textarea
                            value={formData.answerText}
                            onChange={(e) => handleInputChange(e, "answerText")}
                            placeholder="Add reference notes"
                            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        <button
                            onClick={validateReference}
                            type="button"
                            className="mt-2 text-sm text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700"
                        >
                            Validate Reference
                        </button>
                        {renderValidationMessage(validationMessages.referenceText)}
                    </div>
                    <div>
                        <label className="block text-xl font-semibold mb-1">Reference File</label>
                        <div className="flex items-center h-40 justify-center">
                            <label
                                className={`flex flex-col items-center px-4 py-6 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white 
                                    ${isFileSelected ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
                            >
                                <FiFileText size={24} />
                                <span className="mt-2 text-sm">Upload File</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleInputChangeforfile1}
                                />
                            </label>
                        </div>
                        {fileName && (
                            <p className="text-center mt-2 text-lg font-medium text-gray-700 ">
                                Selected File: {fileName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Wrong Answer & Steps */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xl font-semibold">Answer from GenAI (ChatGPT 4.0)</label>
                            <button
                                onClick={handleGenerateResponse}
                                className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Generate Response from GenAI (ChatGPT 4.0)
                            </button>
                        </div>
                        <textarea
                            value={formData.wrongAnswer}
                            onChange={(e) => handleInputChange(e, "wrongAnswer")}
                            placeholder="ChatGPT's incorrect answer"
                            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xl font-semibold  flex items-center justify-between mb-2">Solution from GenAI(ChatGPT 4.0)</label><br />
                        <div className="flex flex-col space-y-2">
                            <textarea
                                value={formData.wrongAnswerText}
                                onChange={(e) => handleInputChange(e, "wrongAnswerText")}
                                placeholder="Steps followed by ChatGPT"
                                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                            />
                            <label
                                className={`flex h-20 flex-col items-center px-4 py-2 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white 
    ${isFileSelected2 ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
                            >
                                <FiFileText size={20} />
                                <span className="mt-1 text-xl">Upload File</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleInputChangeforfile2(e)}
                                />
                            </label>

                            {fileName2 && (
                                <p className="text-center mt-2 text-lg font-medium text-gray-700">
                                    Selected File: {fileName2}
                                </p>
                            )}

                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"


                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-101"

                >

                    Submit Question
                </button>
            </form>
            <ToastContainer />
        </div>
    );
}

export default ClaudeCollection;