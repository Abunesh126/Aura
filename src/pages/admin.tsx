import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { ChevronLeft, Sparkles, Send, Loader2, FileText } from 'lucide-react';

// Types
interface FormData {
  ncoCode: string;
  division: string;
  subDivision: string;
  group: string;
  family: string;
  description: string;
  confidence: number[];
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

// Validation schemas
const validateNcoDetails = (data: FormData) => {
  const errors: Record<string, string> = {};
  if (!data.ncoCode) errors.ncoCode = 'NCO Code is required';
  if (!data.division) errors.division = 'Division is required';
  if (!data.subDivision) errors.subDivision = 'Sub-Division is required';
  if (!data.group) errors.group = 'Group is required';
  if (!data.family) errors.family = 'Family is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateNcoReview = (data: FormData) => {
  const errors: Record<string, string> = {};
  if (!data.description || data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Component Types
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm';
  disabled?: boolean;
  className?: string;
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
}

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
}

// Components
function Card({ children, className = '' }: CardProps) {
  return <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

function Button({ children, onClick, type = 'button', variant = 'default', size = 'default', disabled = false, className = '' }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, className = '' }: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

function Select({ value, onValueChange, disabled, children }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants: Record<'default' | 'secondary', string> = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Slider({ value, onValueChange, min, max, step }: SliderProps) {
  return (
    <div className="relative flex w-full touch-none select-none items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="relative h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-blue-700"
      />
    </div>
  );
}

// Mock API function
const getNcoDescriptionSuggestion = async (data: { division: string; subDivision: string; group: string; family: string }) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    description: `Professional role in ${data.family} within ${data.group}. Responsibilities include specialized tasks related to ${data.division} operations and ${data.subDivision} management.`
  };
};

// Form Select Component
function FormSelect({ label, placeholder, options, value, onChange, disabled = false, error }: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled || options.length === 0}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Form Wrapper Component
function NcoFormWrapper({ step, title, description, children, className = '' }: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-4 shadow-lg">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">NCO Admin Assistant</h1>
        <p className="text-gray-600 mt-2">
          Streamline your National Classification of Occupations data management.
        </p>
      </header>
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <span className="text-xl font-bold">Step {step}: {title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

// Details Form Component
function NcoFormDetails({ onNext, formData, setFormData }: {
  onNext: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    setFormData(prev => ({ ...prev, subDivision: '' }));
  }, [formData.division, setFormData]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, group: '' }));
  }, [formData.subDivision, setFormData]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, family: '' }));
  }, [formData.group, setFormData]);

  const handleSubmit = () => {
    const validation = validateNcoDetails(formData);
    
    if (validation.isValid) {
      setErrors({});
      onNext();
    } else {
      setErrors(validation.errors);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">NCO Code</label>
        <Input
          value={formData.ncoCode}
          onChange={(value) => updateField('ncoCode', value)}
          placeholder="e.g., 1111"
        />
        {errors.ncoCode && <p className="text-sm text-red-600">{errors.ncoCode}</p>}
      </div>

      <FormSelect
        label="Division"
        placeholder="Select a division"
        options={divisions}
        value={formData.division}
        onChange={(value) => updateField('division', value)}
        error={errors.division}
      />

      <FormSelect
        label="Sub-Division"
        placeholder="Select a sub-division"
        options={subDivisions}
        value={formData.subDivision}
        onChange={(value) => updateField('subDivision', value)}
        disabled={!formData.division}
        error={errors.subDivision}
      />

      <FormSelect
        label="Group"
        placeholder="Select a group"
        options={groups}
        value={formData.group}
        onChange={(value) => updateField('group', value)}
        disabled={!formData.subDivision}
        error={errors.group}
      />

      <FormSelect
        label="Family"
        placeholder="Select a family"
        options={families}
        value={formData.family}
        onChange={(value) => updateField('family', value)}
        disabled={!formData.group}
        error={errors.family}
      />

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit}>
          Submit
         
        </Button>
      </div>
    </div>
  );
}

// Review Form Component
function NcoFormReview({ onBack, onSubmit, formData, setFormData }: {
  onBack: () => void;
  onSubmit: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSuggestDescription = () => {
    const { division, subDivision, group, family } = formData;

    startTransition(async () => {
      try {
        const result = await getNcoDescriptionSuggestion({ division, subDivision, group, family });
        if (result.success && result.description) {
          setFormData(prev => ({ ...prev, description: result.description }));
          showToast('Suggestion Ready', 'An AI-generated description has been populated.');
        } else {
          showToast('Suggestion Failed', 'Could not generate a description. Please try again.', 'error');
        }
      } catch {
        showToast('Suggestion Failed', 'Could not generate a description. Please try again.', 'error');
      }
    });
  };

  const showToast = (title: string, description: string, type: string = 'success') => {
    // Simple toast simulation - replace with your toast library
    console.log(`${type.toUpperCase()}: ${title} - ${description}`);
  };

  const handleSubmitReview = () => {
    const validation = validateNcoReview(formData);
    
    if (validation.isValid) {
      setErrors({});
      console.log('Final Data:', formData);
      showToast('Submission Successful!', `NCO entry ${formData.ncoCode} has been submitted.`);
      onSubmit();
    } else {
      setErrors(validation.errors);
    }
  };

  const updateField = (field: keyof FormData, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Reviewing NCO Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">{formData.division}</Badge>
          <Badge variant="secondary">{formData.subDivision}</Badge>
          <Badge variant="secondary">{formData.group}</Badge>
          <Badge variant="secondary">{formData.family}</Badge>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={handleSuggestDescription} 
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Suggest Description
            </Button>
          </div>
          <Textarea
            value={formData.description}
            onChange={(value) => updateField('description', value)}
            placeholder="Enter a detailed description..."
            rows={5}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Confidence Score</label>
            <span className="text-sm font-medium text-blue-600">{formData.confidence[0]}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={formData.confidence}
            onValueChange={(value) => updateField('confidence', value)}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSubmitReview} className="bg-green-600 hover:bg-green-700 text-white">
            Submit Entry
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// Main Application
export default function NcoAdminApp() {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: details, 2: review
  const [formData, setFormData] = useState<FormData>({
    ncoCode: '',
    division: '',
    subDivision: '',
    group: '',
    family: '',
    description: '',
    confidence: [75]
  });

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    setFormData({
      ncoCode: '',
      division: '',
      subDivision: '',
      group: '',
      family: '',
      description: '',
      confidence: [75]
    });
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {currentStep === 1 ? (
          <NcoFormWrapper
            step={1}
            title="NCO Details"
            description="Select the classification details for the new NCO entry."
          >
            <NcoFormDetails
              onNext={handleNext}
              formData={formData}
              setFormData={setFormData}
            />
          </NcoFormWrapper>
        ) : (
          <NcoFormWrapper
            step={2}
            title="Review & Submit"
            description="Review your NCO entry details and add a description before submitting."
          >
            <NcoFormReview
              onBack={handleBack}
              onSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
            />
          </NcoFormWrapper>
        )}
      </div>
    </div>
  );
}