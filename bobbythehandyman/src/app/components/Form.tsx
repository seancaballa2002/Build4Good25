"use client";

import { useState } from "react";
import { FormData } from "@/types";

interface FormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function Form({ onSubmit, isLoading = false }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    issue: "",
    description: "",
    name: "",
    address: "",
    timesAvailable: [],
    desiredPriceRange: ""
  });

  const [rawInput, setRawInput] = useState("");
  const [inputMode, setInputMode] = useState<"structured" | "raw">("structured");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      timesAvailable: checked 
        ? [...prev.timesAvailable, value]
        : prev.timesAvailable.filter(time => time !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === "raw") {
      // For raw input, we'll pass it to the LLM parser
      onSubmit({
        ...formData,
        issue: rawInput, // We'll use the issue field to pass the raw input
        description: "",
        timesAvailable: []
      });
    } else {
      // For structured input, validate required fields
      if (!formData.issue || !formData.name || !formData.address || !formData.desiredPriceRange) {
        alert("Please fill in all required fields");
        return;
      }
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Describe Your Household Issue</h2>
      
      <div className="flex justify-center mb-6">
        <div className="flex rounded-md overflow-hidden border">
          <button
            type="button"
            className={`px-4 py-2 ${inputMode === "structured" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setInputMode("structured")}
          >
            Form
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${inputMode === "raw" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setInputMode("raw")}
          >
            Quick Input
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMode === "raw" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Describe your issue (include location, availability, and budget if possible)
            </label>
            <textarea
              className="w-full p-3 border rounded-md dark:bg-gray-700"
              rows={5}
              placeholder="Example: My faucet is leaking under the kitchen sink. I live in Plano. Can do Saturday morning. Budget is around $65."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              required
            />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Issue (required)
              </label>
              <input
                type="text"
                name="issue"
                className="w-full p-3 border rounded-md dark:bg-gray-700"
                placeholder="e.g., Leaky faucet"
                value={formData.issue}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                className="w-full p-3 border rounded-md dark:bg-gray-700"
                placeholder="e.g., Under kitchen sink, slow drip"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Your Name (required)
              </label>
              <input
                type="text"
                name="name"
                className="w-full p-3 border rounded-md dark:bg-gray-700"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Address or Zip Code (required)
              </label>
              <input
                type="text"
                name="address"
                className="w-full p-3 border rounded-md dark:bg-gray-700"
                placeholder="e.g., Plano, TX or 75025"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Available Times (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Weekday mornings", "Weekday afternoons", "Weekday evenings", 
                  "Weekend mornings", "Weekend afternoons", "Weekend evenings"].map(time => (
                  <label key={time} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={time}
                      checked={formData.timesAvailable.includes(time)}
                      onChange={handleTimeSlotChange}
                      className="rounded"
                    />
                    <span>{time}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Desired Price Range (required)
              </label>
              <input
                type="text"
                name="desiredPriceRange"
                className="w-full p-3 border rounded-md dark:bg-gray-700"
                placeholder="e.g., $60-80 or $65"
                value={formData.desiredPriceRange}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Get Quotes"}
        </button>
      </form>
    </div>
  );
} 