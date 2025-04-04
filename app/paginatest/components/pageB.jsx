import React from "react";

const PagB = ({ useLocation }) => {
  const location = useLocation();
  const formData = location.state || {};

  const renderPlutoane = (numar) => {
    const plutoane = [];
    const count = parseInt(numar) || 0;

    for (let i = 1; i <= count; i++) {
      plutoane.push(
        <td
          key={i}
          style={{
            border: "1px solid #ddd",
            backgroundColor: "#f2f9ff",
            textAlign: "center",
            width: "35px",
            height: "35px",
            fontWeight: "bold",
            color: "#3498db",
          }}
        >
          {i}
        </td>
      );
    }

    return plutoane;
  };

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    backgroundColor: "white",
  };

  const headerStyle = {
    background: "#3498db",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    border: "1px solid #2980b9",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    border: "2px solid #3498db",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    fontSize: "15px",
  };

  const companieStyle = {
    ...cellStyle,
    textAlign: "center",
    backgroundColor: "#e8f4fb",
    fontWeight: "bold",
    color: "#2c3e50",
  };

  const plutoane1 = parseInt(formData.plutoane1) || 0;
  const plutoane2 = parseInt(formData.plutoane2) || 0;
  const plutoane3 = parseInt(formData.plutoane3) || 0;
  const plutoane4 = parseInt(formData.plutoane4) || 0;

  return (
    <div style={{ margin: "20px auto", maxWidth: "1000px" }}>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <th style={headerStyle}>Facultate</th>
            <td colSpan="20" style={cellStyle}>
              {formData.facultate || ""}
            </td>
          </tr>
          <tr>
            <th style={headerStyle}>Adresa</th>
            <td colSpan="20" style={cellStyle}>
              {formData.adresa || ""}
            </td>
          </tr>
          <tr>
            <th style={headerStyle}>Data înființării</th>
            <td colSpan="20" style={cellStyle}>
              {formData.dataInfiintarii || ""}
            </td>
          </tr>
          <tr>
            <th style={headerStyle}>Batalion</th>
            <td colSpan="20" style={cellStyle}>
              {formData.batalion || ""}
            </td>
          </tr>
          <tr>
            <th style={headerStyle}>Companii</th>
            {plutoane1 > 0 && (
              <td colSpan={plutoane1} style={companieStyle}>
                {formData.companie1 || ""}
              </td>
            )}
            {plutoane2 > 0 && (
              <td colSpan={plutoane2} style={companieStyle}>
                {formData.companie2 || ""}
              </td>
            )}
            {plutoane3 > 0 && (
              <td colSpan={plutoane3} style={companieStyle}>
                {formData.companie3 || ""}
              </td>
            )}
            {plutoane4 > 0 && (
              <td colSpan={plutoane4} style={companieStyle}>
                {formData.companie4 || ""}
              </td>
            )}
          </tr>
          <tr>
            <th style={headerStyle}>Plutoane</th>
            {renderPlutoane(formData.plutoane1)}
            {renderPlutoane(formData.plutoane2)}
            {renderPlutoane(formData.plutoane3)}
            {renderPlutoane(formData.plutoane4)}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PagB;
