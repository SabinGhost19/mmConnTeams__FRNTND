"use client";
import { useState } from "react";
import { useTestApi } from "../hooks/useTestApi";

function YourComponent() {
  const testMutation = useTestApi();
  const [response, setResponse] = useState("");

  const handleClick = () => {
    testMutation.mutate(
      { someData: "value" },
      {
        onSuccess: (data) => {
          console.log("Success:", data);
          setResponse(JSON.stringify(data));
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      }
    );
  };

  return (
    <div>
      <button onClick={handleClick}>Test API</button>
      {testMutation.isPending && <p>Se încarcă...</p>}
      {testMutation.isError && <p>Eroare: {testMutation.error.message}</p>}
      {testMutation.isSuccess && <p>Succes!...{response}</p>}
    </div>
  );
}

export default YourComponent;
