import React, { useState, useEffect, useMemo } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface FormData {
  ncoCode: string;
  title: string;
  description: string;
  division: string;
  subDivision: string;
  group: string;
  family: string;
  confidenceScore: number[];
}

// Mock data for NCO structure
const ncoData = {
  "Division A": {
    "Sub-Division A1": {
      "Group A1-1": ["Family A1-1-1", "Family A1-1-2"],
      "Group A1-2": ["Family A1-2-1", "Family A1-2-2"]
    },
    "Sub-Division A2": {
      "Group A2-1": ["Family A2-1-1"],
      "Group A2-2": ["Family A2-2-1", "Family A2-2-2"]
    }
  },
  "Division B": {
    "Sub-Division B1": {
      "Group B1-1": ["Family B1-1-1", "Family B1-1-2"],
      "Group B1-2": ["Family B1-2-1"]
    }
  }
};

const divisions = Object.keys(ncoData);

// Validation
const validateForm = (data: FormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.ncoCode) errors.ncoCode = 'NCO Code is required';
  if (!data.title) errors.title = 'Title is required';
  if (!data.description || data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  if (!data.division) errors.division = 'Division is required';
  if (!data.subDivision) errors.subDivision = 'Sub-Division is required';
  if (!data.group) errors.group = 'Group is required';
  if (!data.family) errors.family = 'Family is required';
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Component Types  
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline';
  disabled?: boolean;
  className?: string;
}

interface FormFieldProps {
  label: string | React.ReactNode;
  children: React.ReactNode;
  error?: string;
}

// UI Components
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, type = 'button', variant = 'default', disabled = false, className = '' }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 h-10';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, className = '' }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, className = '' }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    />
  );
}

function Select({ value, onValueChange, disabled, children, className = '' }: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
  );
}

function Slider({ value, onValueChange, min, max, step }: {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="relative flex w-full touch-none select-none items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="relative h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg"
      />
    </div>
  );
}

function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Main Component
export default function NcoSingleForm() {
  const [formData, setFormData] = useState<FormData>({
    ncoCode: '',
    title: '',
    description: '',
    division: '',
    subDivision: '',
    group: '',
    family: '',
    confidenceScore: [50]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic options based on selections
  const subDivisions = useMemo(() => {
    if (!formData.division) return [];
    return Object.keys(ncoData[formData.division as keyof typeof ncoData] || {});
  }, [formData.division]);

  const groups = useMemo(() => {
    if (!formData.division || !formData.subDivision) return [];
    const divisionData = ncoData[formData.division as keyof typeof ncoData];
    return Object.keys(divisionData[formData.subDivision as keyof typeof divisionData] || {});
  }, [formData.division, formData.subDivision]);

  const families = useMemo(() => {
    if (!formData.division || !formData.subDivision || !formData.group) return [];
    const divisionData = ncoData[formData.division as keyof typeof ncoData];
    const subDivisionData = divisionData[formData.subDivision as keyof typeof divisionData];
    return subDivisionData[formData.group as keyof typeof subDivisionData] || [];
  }, [formData.division, formData.subDivision, formData.group]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, subDivision: '', group: '', family: '' }));
  }, [formData.division]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, group: '', family: '' }));
  }, [formData.subDivision]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, family: '' }));
  }, [formData.group]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(formData);
    
    if (validation.isValid) {
      setErrors({});
      console.log('Form submitted:', formData);
      // Handle form submission here
      alert('NCO entry saved successfully!');
    } else {
      setErrors(validation.errors);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-3 shadow-lg">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">National Classification of Occupations</h1>
        </div>

        {/* Form Card */}
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="NCO Code" error={errors.ncoCode}>
              <Input
                value={formData.ncoCode}
                onChange={(value: string) => updateField('ncoCode', value)}
                placeholder="Enter NCO code"
              />
            </FormField>

            <FormField label="Title" error={errors.title}>
              <Input
                value={formData.title}
                onChange={(value: string) => updateField('title', value)}
                placeholder="Enter job title"
              />
            </FormField>

            <FormField label="Description" error={errors.description}>
              <Textarea
                value={formData.description}
                onChange={(value: string) => updateField('description', value)}
                placeholder="Enter detailed description"
                rows={3}
              />
            </FormField>

            <FormField label="Division" error={errors.division}>
              <Select
                value={formData.division}
                onValueChange={(value: string) => updateField('division', value)}
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Sub - Division" error={errors.subDivision}>
              <Select
                value={formData.subDivision}
                onValueChange={(value: string) => updateField('subDivision', value)}
                disabled={!formData.division}
              >
                <option value="">Select Sub-Division</option>
                {subDivisions.map((subDiv) => (
                  <option key={subDiv} value={subDiv}>
                    {subDiv}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Group" error={errors.group}>
              <Select
                value={formData.group}
                onValueChange={(value: string) => updateField('group', value)}
                disabled={!formData.subDivision}
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Family" error={errors.family}>
              <Select
                value={formData.family}
                onValueChange={(value: string) => updateField('family', value)}
                disabled={!formData.group}
              >
                <option value="">Select Family</option>
                {families.map((family: string) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField 
              label={
                <div className="flex items-center justify-between">
                  <span>Confidence Score</span>
                  <span className="text-blue-600 font-medium">{formData.confidenceScore[0]}%</span>
                </div>
              }
            >
              <Slider
                min={0}
                max={100}
                step={1}
                value={formData.confidenceScore}
                onValueChange={(value: number[]) => updateField('confidenceScore', value)}
              />
            </FormField>

            <div className="pt-4">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => console.log('Previous clicked')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  className="flex items-center"
                  onClick={() => console.log('Next clicked')}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}