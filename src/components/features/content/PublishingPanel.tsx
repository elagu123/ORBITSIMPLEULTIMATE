import React, { useState } from 'react';
import { PostContent, OptimalTimeSlot, CalendarEvent } from '../../../types/index';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Label from '../../ui/Label';
import { Clock, Sparkles } from '../../ui/Icons';
import { useOptimizedAppData } from '../../../store/optimized/appDataContext';
import { aiService } from '../../../services/aiService';
import { useGamification } from '../../../store/gamificationContext';

interface PublishingPanelProps {
    postContent: PostContent | null;
    postText: string;
    isEnabled: boolean;
}

const PublishingPanel: React.FC<PublishingPanelProps> = ({ postContent, postText, isEnabled }) => {
    const { calendarEvents } = useOptimizedAppData();
    const { addXp, unlockAchievement } = useGamification();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [suggestedTimes, setSuggestedTimes] = useState<OptimalTimeSlot[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const handleSchedule = () => {
        if (!postContent || !postText) return;
        
        const newEvent: CalendarEvent = {
            id: `cal-${Date.now()}`,
            title: postText.substring(0, 30) + '...',
            date,
            time,
            type: 'scheduled_post',
            status: 'scheduled',
            content: postText,
            imageUrl: postContent.imageUrl,
            videoUrl: postContent.videoUrl,
        };

        addCalendarEvent(newEvent);
        addXp(20);
        unlockAchievement('firstSchedule');
        if (calendarEvents.length + 1 >= 5) unlockAchievement('plannerPro');
        alert('Post scheduled successfully and added to your calendar!');
    };

    const handleSuggestTimes = async () => {
        setIsLoadingSuggestions(true);
        try {
            const times = await aiService.getOptimalPostingTimes(calendarEvents);
            setSuggestedTimes(times.slice(0, 3)); // Show top 3 suggestions
        } catch (error) {
            console.error(error);
            alert("Could not fetch AI time suggestions.");
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Publishing</h4>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="publish-date">Date</Label>
                    <Input id="publish-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="publish-time">Time</Label>
                    <Input id="publish-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                <Button variant="secondary" size="sm" onClick={handleSuggestTimes} disabled={isLoadingSuggestions}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoadingSuggestions ? "Analyzing..." : "Suggest Times"}
                </Button>
                {suggestedTimes.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {suggestedTimes.map(slot => {
                            const timeToSet = slot.time.split(' at ')[1] ? slot.time.split(' at ')[1].replace(' AM','').replace(' PM', '') : slot.time; // Handle formats like "Wednesday at 7:00 PM"
                            return (
                                <button 
                                  key={slot.time} 
                                  onClick={() => setTime(timeToSet)} 
                                  className="p-1 text-xs text-center bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 rounded-md hover:bg-primary-200"
                                  title={slot.reason}
                                >
                                    {slot.time}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <Button onClick={handleSchedule} disabled={!isEnabled} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Post
            </Button>
        </div>
    );
};

export default PublishingPanel;