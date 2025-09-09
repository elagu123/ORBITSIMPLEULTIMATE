import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-primary-600');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(button).toHaveClass('bg-gray-600');
    
    rerender(<Button variant="danger">Danger</Button>);
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    
    rerender(<Button size="md">Medium</Button>);
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    
    rerender(<Button size="lg">Large</Button>);
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('can be rendered as different HTML elements', () => {
    render(<Button as="a" href="https://example.com">Link Button</Button>);
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading Button');
    
    // Check for loading spinner (assuming it uses a class or data attribute)
    const spinner = button.querySelector('[data-testid="loading-spinner"]') || 
                   button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button with ref</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Button with ref');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles form submission when type is submit', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(document.activeElement).toBe(button);
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has proper ARIA attributes when disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button>Focus Test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('supports aria-label for icon buttons', () => {
      render(
        <Button aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });

    it('supports aria-describedby for additional context', () => {
      render(
        <>
          <Button aria-describedby="button-help">Submit Form</Button>
          <div id="button-help">This will save your changes</div>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');
    });
  });

  describe('Loading State', () => {
    it('shows loading text when provided', () => {
      render(
        <Button loading loadingText="Saving...">
          Save Changes
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Saving...');
      expect(button).toBeDisabled();
    });

    it('keeps original text when no loading text provided', () => {
      render(<Button loading>Save Changes</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Save Changes');
      expect(button).toBeDisabled();
    });
  });

  describe('Event Handling', () => {
    it('prevents default when onClick returns false', () => {
      const preventDefault = jest.fn();
      const handleClick = jest.fn(() => false);
      
      render(<Button onClick={handleClick}>Test Button</Button>);
      
      const button = screen.getByRole('button');
      const event = { preventDefault };
      
      fireEvent.click(button, event);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple event types', () => {
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          Interactive Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
      
      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });
});