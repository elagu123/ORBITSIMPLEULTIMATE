import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { CalendarEvent } from '../../../types/index';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Label from '../../ui/Label';
import Textarea from '../../ui/Textarea';
import Select from '../../ui/Select';

interface EventFormProps {
  event: CalendarEvent | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'scheduled_post' as CalendarEvent['type'],
    status: 'draft' as CalendarEvent['status'],
    content: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        type: event.type,
        status: event.status,
        content: event.content || ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'scheduled_post',
        status: 'draft',
        content: ''
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert('Title and Date are required.');
      return;
    }
    onSubmit(event ? { ...event, ...formData } : formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={4} placeholder="Write your social media post here..." />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Event</Button>
      </div>
    </form>
  );
};

export default EventForm;