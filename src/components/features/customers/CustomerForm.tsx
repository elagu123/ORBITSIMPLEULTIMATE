import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CustomerFormData } from '../../../types/index';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Label from '../../ui/Label';
import Textarea from '../../ui/Textarea';
import Select from '../../ui/Select';

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    business: {
      lifecycle: 'lead',
      source: 'organic',
      tags: [],
      dateAdded: new Date().toISOString().split('T')[0],
    },
    transactions: {
      totalSpent: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
    },
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (field) { // Nested state
        setFormData(prev => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value,
            }
        }));
    } else { // Top-level state (e.g., notes)
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personal.firstName || !formData.personal.email) {
      alert('First Name and Email are required.');
      return;
    }
    onSubmit(formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Personal Info Section */}
      <fieldset>
        <legend className="text-lg font-medium text-gray-900 dark:text-white mb-2">Personal Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="personal.firstName" value={formData.personal.firstName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="personal.lastName" value={formData.personal.lastName} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="personal.email" type="email" value={formData.personal.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="personal.phone" type="tel" value={formData.personal.phone} onChange={handleChange} />
          </div>
        </div>
      </fieldset>

      {/* Business Details Section */}
       <fieldset>
        <legend className="text-lg font-medium text-gray-900 dark:text-white mb-2">Business Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lifecycle">Lifecycle Stage</Label>
              <Select id="lifecycle" name="business.lifecycle" value={formData.business.lifecycle} onChange={handleChange}>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="vip">VIP</option>
                <option value="lost">Lost</option>
              </Select>
            </div>
             <div>
              <Label htmlFor="source">Source</Label>
              <Select id="source" name="business.source" value={formData.business.source} onChange={handleChange}>
                <option value="organic">Organic</option>
                <option value="paid">Paid Ad</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
              </Select>
            </div>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Customer</Button>
      </div>
    </form>
  );
};

export default CustomerForm;