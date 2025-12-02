import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock nodemailer before importing EmailService
const mockTransporter = {
  sendMail: vi.fn(),
  verify: vi.fn(),
};

// Mock nodemailer as a named export (since EmailService imports it as * as nodemailer)
vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => mockTransporter),
}));

// Import EmailService after mocking
import { EmailService } from './email.service';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Reset environment variables for each test
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'test-password';
    process.env.SMTP_FROM = 'test@example.com';

    // Clear all mocks
    vi.clearAllMocks();

    // Reset mock transporter
    mockTransporter.sendMail.mockReset();
    mockTransporter.verify.mockReset();

    // Create service instance (this will use our mocked createTransport)
    emailService = new EmailService();
  });

  describe('sendBackupNotification', () => {
    it('should send backup notification successfully', async () => {
      // Setup mock to resolve successfully
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendBackupNotification(
        'admin@example.com',
        'Admin User',
        {
          collections: { users: 10, rideLocations: 5 },
          filename: 'backup-2025-01-01.json',
        }
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: expect.stringContaining('Backup Completed'),
        })
      );
    });

    it('should handle email sending (no format validation)', async () => {
      // Setup mock to resolve successfully
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendBackupNotification(
        'invalid-email',
        'Test User',
        { collections: {}, filename: 'test.json' }
      );

      // Current implementation doesn't validate email format - just attempts to send
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should handle SMTP errors gracefully', async () => {
      // Setup mock to reject with SMTP error
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Connection Failed'));

      const result = await emailService.sendBackupNotification(
        'admin@example.com',
        'Admin User',
        { collections: {}, filename: 'test.json' }
      );

      // Should return false on error
      expect(result).toBe(false);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });
  });

  // Private methods are tested indirectly through public methods
  // HTML and text generation is tested via sendBackupNotification calls
});
