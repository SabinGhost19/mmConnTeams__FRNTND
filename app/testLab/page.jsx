"use client";
import React, { useState } from "react";
import { Router } from "lucide-react";

const PagA = () => {
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

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Formular facultate</h2>

        <div className="form-group">
          <label>Facultate:</label>
          <input
            type="text"
            name="facultate"
            value={formData.facultate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Adresa:</label>
          <input
            type="text"
            name="adresa"
            value={formData.adresa}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Data înființării:</label>
          <input
            type="text"
            name="dataInfiintarii"
            value={formData.dataInfiintarii}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Batalion:</label>
          <input
            type="text"
            name="batalion"
            value={formData.batalion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Companie 1:</label>
          <input
            type="text"
            name="companie1"
            value={formData.companie1}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Plutoane:</label>
          <input
            type="text"
            name="plutoane1"
            value={formData.plutoane1}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Companie 2:</label>
          <input
            type="text"
            name="companie2"
            value={formData.companie2}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Plutoane:</label>
          <input
            type="text"
            name="plutoane2"
            value={formData.plutoane2}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Companie 3:</label>
          <input
            type="text"
            name="companie3"
            value={formData.companie3}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Plutoane:</label>
          <input
            type="text"
            name="plutoane3"
            value={formData.plutoane3}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Companie 4:</label>
          <input
            type="text"
            name="companie4"
            value={formData.companie4}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Plutoane:</label>
          <input
            type="text"
            name="plutoane4"
            value={formData.plutoane4}
            onChange={handleChange}
          />
        </div>

        <div className="form-buttons">
          <input type="submit" value="Submit" />
          <input type="button" value="Reset" onClick={handleReset} />
        </div>
      </form>
    </div>
  );
};

export default PagA;
