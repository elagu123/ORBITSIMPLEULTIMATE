import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdvancedContentGenerator from '../AdvancedContentGenerator';
import { CombinedProvider } from '../../../../store/optimized/CombinedProvider';

// Mock the AI service
jest.mock('../../../../services/aiService', () => ({
  aiService: {
    generateContent: jest.fn(),
    analyzeContent: jest.fn(),
    generateVariations: jest.fn(),
  }
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <CombinedProvider>
      {component}
    </CombinedProvider>
  );
};

const mockProps = {
  onContentGenerated: jest.fn(),
  onSuggestionSelect: jest.fn(),
  businessContext: {
    name: 'Test Business',
    industry: 'Technology',
    tone: 'Professional'
  },
  isVisible: true
};

describe('AdvancedContentGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the content generator interface', () => {
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      expect(screen.getByText(/AI Content Studio/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/describe what you want to create/i)).toBeInTheDocument();
      expect(screen.getByText(/Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Tone/i)).toBeInTheDocument();
      expect(screen.getByText(/Length/i)).toBeInTheDocument();
    });

    it('displays platform selection options', () => {
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      // Check if platform options are available
      expect(screen.getByDisplayValue(/facebook/i)).toBeInTheDocument();
    });

    it('shows content settings panel', () => {
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      expect(screen.getByText(/Content Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Casual/i)).toBeInTheDocument();
      expect(screen.getByText(/Professional/i)).toBeInTheDocument();
      expect(screen.getByText(/Friendly/i)).toBeInTheDocument();
    });
  });

  describe('Content Generation', () => {
    it('generates content when form is submitted', async () => {
      const user = userEvent.setup();
      const mockGenerateContent = require('../../../../services/aiService').aiService.generateContent;
      mockGenerateContent.mockResolvedValueOnce({
        content: 'Generated marketing content for your business!',
        hashtags: ['#marketing', '#business'],
        suggestions: ['Add more emojis', 'Include call-to-action']
      });

      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      await user.type(promptInput, 'Create a post about our new product launch');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalledWith(
          expect.stringContaining('Create a post about our new product launch')
        );
      });
    });

    it('displays generated content suggestions', async () => {
      const user = userEvent.setup();
      const mockGenerateContent = require('../../../../services/aiService').aiService.generateContent;
      mockGenerateContent.mockResolvedValueOnce({
        suggestions: [
          {
            id: '1',
            type: 'post',
            title: 'Product Launch Announcement',
            content: 'Exciting news! We are launching our new product...',
            hashtags: ['#launch', '#product'],
            tone: 'exciting',
            targetAudience: 'general',
            estimatedPerformance: { engagement: 85, reach: 1200, impressions: 3000 },
            suggestedTime: '2024-01-15T10:00:00Z',
            mediaType: 'text'
          }
        ]
      });

      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      await user.type(promptInput, 'Product launch post');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Product Launch Announcement')).toBeInTheDocument();
        expect(screen.getByText(/Exciting news! We are launching/)).toBeInTheDocument();
      });
    });

    it('handles generation errors gracefully', async () => {
      const user = userEvent.setup();
      const mockGenerateContent = require('../../../../services/aiService').aiService.generateContent;
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      await user.type(promptInput, 'Test content');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error generating content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Content Customization', () => {
    it('allows changing platform settings', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const platformSelect = screen.getByRole('combobox');
      await user.selectOptions(platformSelect, 'instagram');
      
      expect(platformSelect).toHaveValue('instagram');
    });

    it('allows changing tone settings', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const friendlyTone = screen.getByLabelText(/friendly/i);
      await user.click(friendlyTone);
      
      expect(friendlyTone).toBeChecked();
    });

    it('allows changing length settings', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const longLength = screen.getByLabelText(/long/i);
      await user.click(longLength);
      
      expect(longLength).toBeChecked();
    });
  });

  describe('Performance Predictions', () => {
    it('displays estimated performance metrics', async () => {
      const user = userEvent.setup();
      const mockGenerateContent = require('../../../../services/aiService').aiService.generateContent;
      mockGenerateContent.mockResolvedValueOnce({
        suggestions: [
          {
            id: '1',
            type: 'post',
            title: 'Test Post',
            content: 'Test content',
            hashtags: [],
            tone: 'professional',
            targetAudience: 'general',
            estimatedPerformance: { engagement: 75, reach: 1500, impressions: 4000 },
            suggestedTime: '2024-01-15T14:00:00Z',
            mediaType: 'text'
          }
        ]
      });

      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      await user.type(promptInput, 'Test content');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument(); // Engagement
        expect(screen.getByText('1.5K')).toBeInTheDocument(); // Reach
        expect(screen.getByText('4K')).toBeInTheDocument(); // Impressions
      });
    });
  });

  describe('Content Export and Selection', () => {
    it('calls onSuggestionSelect when content is selected', async () => {
      const user = userEvent.setup();
      const mockGenerateContent = require('../../../../services/aiService').aiService.generateContent;
      mockGenerateContent.mockResolvedValueOnce({
        suggestions: [
          {
            id: '1',
            type: 'post',
            title: 'Test Post',
            content: 'Selected content',
            hashtags: ['#test'],
            tone: 'professional',
            targetAudience: 'general',
            estimatedPerformance: { engagement: 80, reach: 1000, impressions: 2500 },
            suggestedTime: '2024-01-15T12:00:00Z',
            mediaType: 'text'
          }
        ]
      });

      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      await user.type(promptInput, 'Test content');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Selected content')).toBeInTheDocument();
      });
      
      const selectButton = screen.getByText(/Use This Content/i);
      await user.click(selectButton);
      
      expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Selected content',
          hashtags: ['#test']
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      expect(promptInput).toHaveAttribute('aria-label');
      
      const generateButton = screen.getByText(/Generate Content/i);
      expect(generateButton).toHaveAttribute('role', 'button');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvancedContentGenerator {...mockProps} />);
      
      const promptInput = screen.getByPlaceholderText(/describe what you want to create/i);
      const generateButton = screen.getByText(/Generate Content/i);
      
      // Tab navigation should work
      await user.tab();
      expect(promptInput).toHaveFocus();
      
      // Should be able to navigate to generate button
      await user.tab();
      // Skip through other form elements
      await user.tab();
      await user.tab();
      await user.tab();
      expect(generateButton).toHaveFocus();
    });
  });
});