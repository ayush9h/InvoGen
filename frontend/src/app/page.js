"use client";
import { useState } from "react";
import axios from "axios";
import Navbar from "./components/navbar";

export default function Home() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState("");
  const [keywordList, setKeywordList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleKeywordChange = (e) => {
    setKeywords(e.target.value);
  };

  const handleAddKeyword = () => {
    if (keywords.trim()) {
      setKeywordList((prevList) => [...prevList, keywords.trim()]);
      setKeywords("");
    }
  };

  const handleRemoveKeyword = (index) => {
    setKeywordList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("keywords", keywordList.join(","));

    try {
      const response = await axios.post(
        "http://localhost:5000/extract-details",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const formattedOutput = formatOutput(response.data.details);
      setOutput(formattedOutput);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "There was an error processing your request."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatOutput = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      <Navbar />
      <div className='max-w-7xl h-96 mx-auto flex flex-col justify-center items-center text-center'>
        <h1 className='text-white font-semibold text-6xl mt-40'>
          Extract invoices{" "}
          <span className='bg-gradient-to-r from-green-500 via-green-300 to-green-500 bg-clip-text text-transparent'>
            effortlessly.
          </span>
        </h1>
        <p className='mt-4 text-slate-500 text-xl'>
          Smart way to extract information from invoices using Generative AI.
        </p>
        <a
          href='#get-started'
          className='mt-6 px-8 py-4 bg-zinc-900 rounded-xl border border-slate-800 hover:border-slate-500 transition-all'>
          Get Started
        </a>
      </div>

      <div
        className='max-w-7xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20'
        id='get-started'>
        <div className='bg-zinc-900 border border-zinc-700 p-8 rounded-md'>
          <h2 className='text-xl mb-4'>1. Upload File</h2>
          <input
            type='file'
            className='w-full text-md text-gray-900 cursor-pointer'
            onChange={handleFileChange}
          />
          {fileName && <p className='mt-2 text-green-500'>{fileName}</p>}

          <h3 className='text-xl mt-6'>2. Enter extracting keywords:</h3>
          <div className='mt-2 flex space-x-4'>
            <input
              type='text'
              value={keywords}
              onChange={handleKeywordChange}
              className='w-full text-md text-gray-200 rounded-md px-4 py-3 bg-zinc-700'
            />
            <button
              onClick={handleAddKeyword}
              className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 uppercase text-sm'>
              Add
            </button>
          </div>
          <div className='mt-4'>
            <h4 className='text-lg'>Keywords to be extracted:</h4>
            <div className='flex flex-wrap gap-2 mt-2'>
              {keywordList.map((keyword, index) => (
                <div
                  key={index}
                  className='bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-2'>
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className='text-xs bg-white text-black rounded-full px-2 py-1'>
                    -
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            className='mt-6 w-full py-4 bg-green-500 uppercase font-semibold text-white rounded-md hover:bg-green-600 transition-all'
            onClick={handleSubmit}>
            Submit
          </button>
        </div>

        <div className='bg-zinc-900 border border-zinc-700 p-8 rounded-xl h-96 overflow-y-auto'>
          <h2 className='text-2xl mb-4'>Generated Output:</h2>
          {loading ? (
            <p className='text-green-500'>Generating...</p>
          ) : (
            <p
              className='text-white'
              dangerouslySetInnerHTML={{ __html: output }}></p>
          )}
          {error && <p className='text-red-500 mt-4'>{error}</p>}
        </div>
      </div>
    </>
  );
}
