import { z } from 'zod';
import {
  loginSchema,
  registerSchema,
  emailSchema,
  passwordSchema,
  contentSchema,
  customerSchema,
  businessProfileSchema
} from '../validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it('should normalize email to lowercase', () => {
      const result = emailSchema.parse('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = emailSchema.parse('  test@example.com  ');
      expect(result).toBe('test@example.com');
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'MyStr0ngP@ss',
        'ComplexPass1',
        'Secure123!'
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',           // Too short
        'password',        // No uppercase or number
        'PASSWORD123',     // No lowercase
        'Password',        // No number
        '12345678',        // No letters
        'Pass1'            // Too short
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it('should require minimum length', () => {
      expect(() => passwordSchema.parse('Aa1')).toThrow();
      expect(() => passwordSchema.parse('Aa1234')).not.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(() => loginSchema.parse(validLogin)).not.toThrow();
    });

    it('should reject login with invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123'
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });

    it('should reject login with empty password', () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: ''
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });

    it('should accept optional rememberMe field', () => {
      const loginWithRemember = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      expect(() => loginSchema.parse(loginWithRemember)).not.toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validRegister = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => registerSchema.parse(validRegister)).not.toThrow();
    });

    it('should reject when passwords do not match', () => {
      const invalidRegister = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject weak passwords', () => {
      const invalidRegister = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'John',
        lastName: 'Doe'
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should trim and validate names', () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: '  John  ',
        lastName: '  Doe  '
      };

      const result = registerSchema.parse(registerData);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should reject invalid names', () => {
      const invalidRegister = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'J', // Too short
        lastName: 'Doe123' // Contains numbers
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });
  });

  describe('contentSchema', () => {
    it('should validate correct content data', () => {
      const validContent = {
        title: 'Test Post',
        content: 'This is test content for the post',
        platform: 'instagram',
        scheduledDate: '2024-07-15',
        scheduledTime: '10:00'
      };

      expect(() => contentSchema.parse(validContent)).not.toThrow();
    });

    it('should reject content with short title', () => {
      const invalidContent = {
        title: 'A', // Too short
        content: 'This is test content for the post',
        platform: 'instagram',
        scheduledDate: '2024-07-15',
        scheduledTime: '10:00'
      };

      expect(() => contentSchema.parse(invalidContent)).toThrow();
    });

    it('should reject content with invalid platform', () => {
      const invalidContent = {
        title: 'Test Post',
        content: 'This is test content for the post',
        platform: 'invalid-platform',
        scheduledDate: '2024-07-15',
        scheduledTime: '10:00'
      };

      expect(() => contentSchema.parse(invalidContent)).toThrow();
    });

    it('should sanitize content by trimming', () => {
      const contentData = {
        title: '  Test Post  ',
        content: '  This is test content  ',
        platform: 'instagram',
        scheduledDate: '2024-07-15',
        scheduledTime: '10:00'
      };

      const result = contentSchema.parse(contentData);
      expect(result.title).toBe('Test Post');
      expect(result.content).toBe('This is test content');
    });
  });

  describe('customerSchema', () => {
    it('should validate correct customer data', () => {
      const validCustomer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234-5678',
        company: 'Acme Corp',
        tags: 'vip, regular'
      };

      expect(() => customerSchema.parse(validCustomer)).not.toThrow();
    });

    it('should make phone optional', () => {
      const customerWithoutPhone = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        tags: 'vip, regular'
      };

      expect(() => customerSchema.parse(customerWithoutPhone)).not.toThrow();
    });

    it('should reject invalid phone format', () => {
      const invalidCustomer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: 'invalid-phone',
        company: 'Acme Corp',
        tags: 'vip, regular'
      };

      expect(() => customerSchema.parse(invalidCustomer)).toThrow();
    });

    it('should sanitize customer data', () => {
      const customerData = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  JOHN.DOE@EXAMPLE.COM  ',
        phone: '  555-1234-5678  ',
        company: '  Acme Corp  ',
        tags: '  vip, regular  '
      };

      const result = customerSchema.parse(customerData);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.company).toBe('Acme Corp');
    });
  });

  describe('businessProfileSchema', () => {
    it('should validate correct business profile', () => {
      const validProfile = {
        businessName: 'Acme Coffee Shop',
        industry: 'food',
        targetAudience: 'coffee lovers',
        goals: 'increase sales',
        currentChallenges: 'low foot traffic'
      };

      expect(() => businessProfileSchema.parse(validProfile)).not.toThrow();
    });

    it('should reject invalid industry', () => {
      const invalidProfile = {
        businessName: 'Acme Coffee Shop',
        industry: 'invalid-industry',
        targetAudience: 'coffee lovers',
        goals: 'increase sales',
        currentChallenges: 'low foot traffic'
      };

      expect(() => businessProfileSchema.parse(invalidProfile)).toThrow();
    });

    it('should require all fields', () => {
      const incompleteProfile = {
        businessName: 'Acme Coffee Shop',
        industry: 'food'
        // Missing required fields
      };

      expect(() => businessProfileSchema.parse(incompleteProfile)).toThrow();
    });

    it('should sanitize business profile data', () => {
      const profileData = {
        businessName: '  Acme Coffee Shop  ',
        industry: 'food',
        targetAudience: '  coffee lovers  ',
        goals: '  increase sales  ',
        currentChallenges: '  low foot traffic  '
      };

      const result = businessProfileSchema.parse(profileData);
      expect(result.businessName).toBe('Acme Coffee Shop');
      expect(result.targetAudience).toBe('coffee lovers');
      expect(result.goals).toBe('increase sales');
      expect(result.currentChallenges).toBe('low foot traffic');
    });
  });

  describe('Input Sanitization', () => {
    it('should prevent XSS in text inputs', () => {
      const maliciousInput = '<script>alert("xss")</script>Test';
      
      // Our schema should reject this due to regex validation
      expect(() => {
        customerSchema.parse({
          firstName: maliciousInput,
          lastName: 'Doe',
          email: 'test@example.com',
          company: 'Corp',
          tags: 'test'
        });
      }).toThrow();
    });

    it('should handle empty strings properly', () => {
      expect(() => emailSchema.parse('')).toThrow();
      expect(() => passwordSchema.parse('')).toThrow();
    });

    it('should handle null and undefined values', () => {
      expect(() => emailSchema.parse(null)).toThrow();
      expect(() => emailSchema.parse(undefined)).toThrow();
    });
  });
});