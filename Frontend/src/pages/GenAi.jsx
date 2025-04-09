import React, { useEffect, useState } from "react";
import TestChart from "./TestChart.jsx";
import HashLoader from "react-spinners/HashLoader.js";

const GenAi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response = await fetch("http://127.0.0.1:8880/gen");
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      let jsonData = await response.json();
      // jsonData = jsonData.replace('```json', '');
      const jsonData1 = jsonData.replace("```", ""); // Remove triple backticks
      const jsonData2 = JSON.parse(jsonData1); // Parse the JSON string
      setData(jsonData2);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // const fetchData = async () => {
  //   setLoading(true);
  //   const prompt = "View results of this report";
  //   try {
  //     // Make sure to include the prompt parameter in the URL
  //     let response = await fetch(
  //       `http://127.0.0.1:8880/gen?prompt=${encodeURIComponent(prompt)}`
  //     );

  //     // Check if the response is okay (status in the range 200-299)
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     let jsonData = await response.json();

  //     // Assuming your API response is a string that may include backticks
  //     const cleanedData = jsonData.replace(/```/g, ""); // Remove all backticks
  //     const parsedData = JSON.parse(cleanedData); // Parse the cleaned JSON string

  //     setData(parsedData); // Update your state with the parsed data
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     // You can handle the error further, e.g., show a notification to the user
  //   } finally {
  //     setLoading(false); // Always set loading to false after the fetch is complete
  //   }
  // };

  const handleReportClick = () => {
    window.open("http://127.0.0.1:8880/report", "_blank"); // Open in new tab
  };

  // const handleReportClick = () => {
  //   const form = document.createElement("form");
  //   form.method = "POST";
  //   form.action = "http://127.0.0.1:8880/report";
  //   form.target = "_blank"; // Opens the form submission in a new tab

  //   document.body.appendChild(form);
  //   form.submit();
  //   document.body.removeChild(form); // Clean up the form element after submission
  // };

  return (
    <>
      <div className="flex justify-center border-b-2 border-gray-200">
        <button
          onClick={fetchData}
          className="bg-blue-500 p-4 m-4 my-8 text-white text-[18px] rounded-md
         border-2 border-blue-500 font-bold hover:bg-white hover:text-blue-500"
        >
          View Results
        </button>
        <button
          onClick={handleReportClick}
          className="bg-gray-800 p-4 m-4 my-8 text-white text-[18px] rounded-md
         border-2 border-gray-800 font-bold hover:bg-white hover:text-gray-800"
        >
          Add Report
        </button>
      </div>
      <div className="flex justify-center my-10">
        {loading ? (
          <HashLoader size={70} color="#0067FF" />
        ) : (
          <div className="flex flex-wrap gap-20 mx-20 justify-center">
            {console.log(data)}
            {data.map((item, index) => (
              <TestChart
                key={index}
                testName={item.Test_Name}
                result={item.Result}
                normalRange={item.Normal_Range}
                explaination={item.Explanation}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GenAi;
