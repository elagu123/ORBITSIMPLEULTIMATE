import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ContentPage from '../../app/content/page';
import { renderWithProviders, mockFetch, setupCommonMocks, cleanupAfterTest } from '../testHelpers';

// Mock AI service
jest.mock('../../services/aiService', () => ({
  aiService: {
    generateContent: jest.fn(),
    analyzeContent: jest.fn(),
    generateVariations: jest.fn(),
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the useProfile hook
jest.mock('../../store/profileContext', () => ({
  useProfile: () => ({
    profile: {
      businessName: 'Test Business',
      industry: 'technology',
      hasOnboarded: true,
    },
  }),
}));

// Mock the gamification context
jest.mock('../../store/gamificationContext', () => ({
  useGamification: () => ({
    completeTask: jest.fn(),
    awardPoints: jest.fn(),
    checkAchievement: jest.fn(),
  }),
}));

describe('Content Creation Flow Integration', () => {
  const cleanup = setupCommonMocks();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    cleanup();
    cleanupAfterTest();
  });

  it('completes full content creation workflow', async () => {
    const user = userEvent.setup();
    const mockAiService = require('../../services/aiService').aiService;
    
    // Mock AI responses
    mockAiService.generateContent.mockResolvedValueOnce({
      content: 'Exciting news! 🚀 We\'re launching our revolutionary new product that will transform how you work. Join us for the grand unveiling next week! #Innovation #TechLaunch #GameChanger',
      hashtags: ['#Innovation', '#TechLaunch', '#GameChanger'],
      estimatedEngagement: 85
    });
    
    mockAiService.analyzeContent.mockResolvedValueOnce({
      tone: 'exciting',
      sentiment: 'positive',
      keywords: ['launch', 'product', 'innovation'],
      engagementScore: 85,
      suggestions: ['Add call-to-action', 'Include launch date']
    });

    renderWithProviders(<ContentPage />);

    // Step 1: Select a template
    const templateSelector = await waitFor(() => 
      screen.getByText(/product launch/i)
    );
    await user.click(templateSelector);

    // Step 2: Wait for template to be selected and content editor to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what's your product launch about/i)).toBeInTheDocument();
    });

    // Step 3: Fill in content details
    const contentInput = screen.getByPlaceholderText(/what's your product launch about/i);
    await user.type(contentInput, 'Revolutionary new productivity tool launching next week');

    // Step 4: Generate AI content
    const generateButton = screen.getByText(/generate content/i);
    await user.click(generateButton);

    // Step 5: Wait for AI content to be generated
    await waitFor(() => {
      expect(mockAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Revolutionary new productivity tool')
      );
    }, { timeout: 5000 });

    // Step 6: Verify generated content appears
    await waitFor(() => {
      expect(screen.getByText(/Exciting news! 🚀/)).toBeInTheDocument();
    });

    // Step 7: Check that hashtags are displayed
    expect(screen.getByText('#Innovation')).toBeInTheDocument();
    expect(screen.getByText('#TechLaunch')).toBeInTheDocument();
    expect(screen.getByText('#GameChanger')).toBeInTheDocument();

    // Step 8: Analyze content
    const analyzeButton = screen.getByText(/analyze content/i);
    await user.click(analyzeButton);

    await waitFor(() => {
      expect(mockAiService.analyzeContent).toHaveBeenCalled();
    });

    // Step 9: Verify analysis results
    await waitFor(() => {
      expect(screen.getByText(/85%/)).toBeInTheDocument(); // Engagement score
      expect(screen.getByText(/positive/i)).toBeInTheDocument(); // Sentiment
    });

    // Step 10: Select platform
    const platformSelector = screen.getByRole('combobox');
    await user.selectOptions(platformSelector, 'instagram');
    expect(platformSelector).toHaveValue('instagram');

    // Step 11: Schedule post (if scheduling component is available)
    const scheduleButton = screen.queryByText(/schedule post/i);
    if (scheduleButton) {
      await user.click(scheduleButton);
      
      // Verify scheduling interface appears
      await waitFor(() => {
        expect(screen.getByText(/select date and time/i)).toBeInTheDocument();
      });
    }

    // Step 12: Verify final post content is ready
    expect(screen.getByText(/Exciting news! 🚀/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('instagram')).toBeInTheDocument();
  });

  it('handles content generation errors gracefully', async () => {
    const user = userEvent.setup();
    const mockAiService = require('../../services/aiService').aiService;
    
    // Mock AI service to fail
    mockAiService.generateContent.mockRejectedValueOnce(
      new Error('API rate limit exceeded')
    );

    renderWithProviders(<ContentPage />);

    // Select template
    const templateSelector = await waitFor(() => 
      screen.getByText(/product launch/i)
    );
    await user.click(templateSelector);

    // Fill in content
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what's your product launch about/i)).toBeInTheDocument();
    });
    
    const contentInput = screen.getByPlaceholderText(/what's your product launch about/i);
    await user.type(contentInput, 'Test product');

    // Try to generate content
    const generateButton = screen.getByText(/generate content/i);
    await user.click(generateButton);

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/error generating content/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify user can retry
    const retryButton = screen.getByText(/try again/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('allows content variations generation', async () => {
    const user = userEvent.setup();
    const mockAiService = require('../../services/aiService').aiService;
    
    // Mock initial content generation
    mockAiService.generateContent.mockResolvedValueOnce({
      content: 'Original content for product launch',
      hashtags: ['#launch', '#product'],
      estimatedEngagement: 75
    });

    // Mock variations generation
    mockAiService.generateVariations.mockResolvedValueOnce({
      variations: [
        'Variation 1: Exciting product launch announcement!',
        'Variation 2: Revolutionary new product coming soon',
        'Variation 3: Don\'t miss our amazing product reveal'
      ]
    });

    renderWithProviders(<ContentPage />);

    // Generate initial content
    const templateSelector = await waitFor(() => 
      screen.getByText(/product launch/i)
    );
    await user.click(templateSelector);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what's your product launch about/i)).toBeInTheDocument();
    });
    
    const contentInput = screen.getByPlaceholderText(/what's your product launch about/i);
    await user.type(contentInput, 'Amazing new product');

    const generateButton = screen.getByText(/generate content/i);
    await user.click(generateButton);

    // Wait for original content
    await waitFor(() => {
      expect(screen.getByText(/Original content for product launch/)).toBeInTheDocument();
    });

    // Generate variations
    const variationsButton = screen.getByText(/generate variations/i);
    await user.click(variationsButton);

    // Verify variations are generated
    await waitFor(() => {
      expect(mockAiService.generateVariations).toHaveBeenCalled();
    });

    // Check variations appear
    await waitFor(() => {
      expect(screen.getByText(/Variation 1: Exciting product launch/)).toBeInTheDocument();
      expect(screen.getByText(/Variation 2: Revolutionary new product/)).toBeInTheDocument();
      expect(screen.getByText(/Variation 3: Don't miss our amazing/)).toBeInTheDocument();
    });
  });

  it('maintains content state during platform switching', async () => {
    const user = userEvent.setup();
    const mockAiService = require('../../services/aiService').aiService;
    
    mockAiService.generateContent.mockResolvedValue({
      content: 'Generated content that should persist',
      hashtags: ['#persistent'],
      estimatedEngagement: 80
    });

    renderWithProviders(<ContentPage />);

    // Generate content
    const templateSelector = await waitFor(() => 
      screen.getByText(/product launch/i)
    );
    await user.click(templateSelector);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what's your product launch about/i)).toBeInTheDocument();
    });
    
    const contentInput = screen.getByPlaceholderText(/what's your product launch about/i);
    await user.type(contentInput, 'Test content');

    const generateButton = screen.getByText(/generate content/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Generated content that should persist/)).toBeInTheDocument();
    });

    // Switch platforms
    const platformSelector = screen.getByRole('combobox');
    await user.selectOptions(platformSelector, 'twitter');
    
    // Verify content persists
    expect(screen.getByText(/Generated content that should persist/)).toBeInTheDocument();
    expect(screen.getByText('#persistent')).toBeInTheDocument();
    
    // Switch to another platform
    await user.selectOptions(platformSelector, 'linkedin');
    
    // Content should still be there
    expect(screen.getByText(/Generated content that should persist/)).toBeInTheDocument();
  });
});