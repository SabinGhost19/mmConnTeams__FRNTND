import React, { useState } from "react";

const PagA = ({ useNavigate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    facultate: "",
    adresa: "",
    dataInfiintarii: "",
    batalion: "",
    companie1: "",
    plutoane1: "",
    companie2: "",
    plutoane2: "",
    companie3: "",
    plutoane3: "",
    companie4: "",
    plutoane4: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    alert("Formular trimis cu succes!");
    navigate("/pagB", { state: formData });
  };

  const handleReset = () => {
    setFormData({
      facultate: "",
      adresa: "",
      dataInfiintarii: "",
      batalion: "",
      companie1: "",
      plutoane1: "",
      companie2: "",
      plutoane2: "",
      companie3: "",
      plutoane3: "",
      companie4: "",
      plutoane4: "",
    });
  };

  const formContainerStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const formGroupStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
  };

  const buttonsContainerStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  };

  const submitButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#27ae60",
    color: "white",
  };

  const resetButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e74c3c",
    color: "white",
  };

  return (
    <div className="form-container" style={formContainerStyle}>
      <form onSubmit={handleSubmit}>
        <h2
          style={{
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "20px",
          }}
        >
          Formular facultate
        </h2>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Facultate:</label>
          <input
            style={inputStyle}
            type="text"
            name="facultate"
            value={formData.facultate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Adresa:</label>
          <input
            style={inputStyle}
            type="text"
            name="adresa"
            value={formData.adresa}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Data înființării:</label>
          <input
            style={inputStyle}
            type="text"
            name="dataInfiintarii"
            value={formData.dataInfiintarii}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Batalion:</label>
          <input
            style={inputStyle}
            type="text"
            name="batalion"
            value={formData.batalion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Companie 1:</label>
          <input
            style={inputStyle}
            type="text"
            name="companie1"
            value={formData.companie1}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Plutoane:</label>
          <input
            style={inputStyle}
            type="text"
            name="plutoane1"
            value={formData.plutoane1}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Companie 2:</label>
          <input
            style={inputStyle}
            type="text"
            name="companie2"
            value={formData.companie2}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Plutoane:</label>
          <input
            style={inputStyle}
            type="text"
            name="plutoane2"
            value={formData.plutoane2}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Companie 3:</label>
          <input
            style={inputStyle}
            type="text"
            name="companie3"
            value={formData.companie3}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Plutoane:</label>
          <input
            style={inputStyle}
            type="text"
            name="plutoane3"
            value={formData.plutoane3}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Companie 4:</label>
          <input
            style={inputStyle}
            type="text"
            name="companie4"
            value={formData.companie4}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={formGroupStyle}>
          <label style={labelStyle}>Plutoane:</label>
          <input
            style={inputStyle}
            type="text"
            name="plutoane4"
            value={formData.plutoane4}
            onChange={handleChange}
          />
        </div>

        <div className="form-buttons" style={buttonsContainerStyle}>
          <input style={submitButtonStyle} type="submit" value="Submit" />
          <input
            style={resetButtonStyle}
            type="button"
            value="Reset"
            onClick={handleReset}
          />
        </div>
      </form>
    </div>
  );
};

export default PagA;
