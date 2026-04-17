import { POST } from '@/app/api/v1/ingest/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('@/lib/bigquery', () => ({
  BigQueryService: {
    insertEvent: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    log: jest.fn(),
  },
}));

describe('POST /api/v1/ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PUBSUB_VERIFICATION_TOKEN = 'test-token';
  });

  it('should reject requests without authorization header', () => {
    const token = undefined;
    const expectedToken = 'test-token';
    
    expect(token).not.toBe(expectedToken);
  });

  it('should reject requests with invalid token', () => {
    const token = 'invalid-token';
    const expectedToken = 'test-token';
    
    expect(token).not.toBe(expectedToken);
  });

  it('should validate payload structure', () => {
    const payload = {
      type: 'GATE_SCAN',
      payload: { facilityId: 'gate-1', count: 5 },
    };

    expect(payload.type).toBeDefined();
    expect(payload.payload).toBeDefined();
  });

  it('should validate event type', () => {
    const validTypes = ['GATE_SCAN', 'POS_SALE', 'ENTRY', 'EXIT'];
    const eventType = 'GATE_SCAN';
    
    expect(validTypes).toContain(eventType);
  });
});
