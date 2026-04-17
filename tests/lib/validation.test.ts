import { Validators, ValidationError, validateSafe } from '@/lib/validation';

describe('Validators', () => {
  describe('location', () => {
    it('should validate correct coordinates', () => {
      const location = Validators.location({ lat: 19.0176, lng: 72.8194 });
      
      expect(location.lat).toBe(19.0176);
      expect(location.lng).toBe(72.8194);
    });

    it('should reject invalid latitude', () => {
      expect(() => Validators.location({ lat: 200, lng: 72.8194 })).toThrow(ValidationError);
    });

    it('should reject invalid longitude', () => {
      expect(() => Validators.location({ lat: 19.0176, lng: 400 })).toThrow(ValidationError);
    });

    it('should reject non-object input', () => {
      expect(() => Validators.location('invalid')).toThrow(ValidationError);
    });
  });

  describe('facilityId', () => {
    it('should validate correct facility ID', () => {
      const id = Validators.facilityId('gate-1');
      expect(id).toBe('gate-1');
    });

    it('should reject empty string', () => {
      expect(() => Validators.facilityId('')).toThrow(ValidationError);
    });

    it('should reject invalid characters', () => {
      expect(() => Validators.facilityId('GATE_1')).toThrow(ValidationError);
    });

    it('should reject non-string input', () => {
      expect(() => Validators.facilityId(123)).toThrow(ValidationError);
    });
  });

  describe('waitTime', () => {
    it('should validate correct wait time', () => {
      const time = Validators.waitTime(15);
      expect(time).toBe(15);
    });

    it('should reject negative values', () => {
      expect(() => Validators.waitTime(-5)).toThrow(ValidationError);
    });

    it('should reject values over 1000', () => {
      expect(() => Validators.waitTime(1001)).toThrow(ValidationError);
    });

    it('should reject non-number input', () => {
      expect(() => Validators.waitTime('15')).toThrow(ValidationError);
    });
  });

  describe('facilityType', () => {
    it('should validate correct types', () => {
      expect(Validators.facilityType('gate')).toBe('gate');
      expect(Validators.facilityType('food')).toBe('food');
      expect(Validators.facilityType('restroom')).toBe('restroom');
    });

    it('should reject invalid types', () => {
      expect(() => Validators.facilityType('invalid')).toThrow(ValidationError);
      expect(() => Validators.facilityType('info')).toThrow(ValidationError);
    });
  });

  describe('email', () => {
    it('should validate correct email', () => {
      const email = Validators.email('user@example.com');
      expect(email).toBe('user@example.com');
    });

    it('should reject invalid email format', () => {
      expect(() => Validators.email('invalid-email')).toThrow(ValidationError);
    });

    it('should reject non-string input', () => {
      expect(() => Validators.email(123)).toThrow(ValidationError);
    });
  });

  describe('password', () => {
    it('should validate correct password', () => {
      const password = Validators.password('SecurePass123');
      expect(password).toBe('SecurePass123');
    });

    it('should reject short passwords', () => {
      expect(() => Validators.password('short')).toThrow(ValidationError);
    });

    it('should reject non-string input', () => {
      expect(() => Validators.password(123)).toThrow(ValidationError);
    });
  });

  describe('validateSafe', () => {
    it('should return value on success', () => {
      const result = validateSafe(() => Validators.facilityId('gate-1'));
      expect(result).toBe('gate-1');
    });

    it('should return null on error', () => {
      const result = validateSafe(() => Validators.facilityId('INVALID'));
      expect(result).toBeNull();
    });

    it('should return default value on error', () => {
      const result = validateSafe(() => Validators.facilityId('INVALID'), 'default');
      expect(result).toBe('default');
    });
  });

  describe('predictionRequest', () => {
    it('should validate correct prediction request', () => {
      const request = Validators.predictionRequest({
        facilityId: 'gate-1',
        type: 'gate',
        currentWait: 10,
      });

      expect(request.facilityId).toBe('gate-1');
      expect(request.type).toBe('gate');
      expect(request.currentWait).toBe(10);
    });

    it('should reject non-object input', () => {
      expect(() => Validators.predictionRequest('invalid')).toThrow(ValidationError);
    });

    it('should reject null input', () => {
      expect(() => Validators.predictionRequest(null)).toThrow(ValidationError);
    });

    it('should validate nested fields', () => {
      expect(() => Validators.predictionRequest({
        facilityId: 'INVALID',
        type: 'gate',
        currentWait: 10,
      })).toThrow(ValidationError);
    });
  });

  describe('ingestEvent', () => {
    it('should validate correct ingest event', () => {
      const event = Validators.ingestEvent({
        type: 'GATE_SCAN',
        facilityId: 'gate-1',
        payload: { count: 5 },
        timestamp: 1234567890,
      });

      expect(event.type).toBe('GATE_SCAN');
      expect(event.facilityId).toBe('gate-1');
      expect(event.payload).toEqual({ count: 5 });
      expect(event.timestamp).toBe(1234567890);
    });

    it('should use current timestamp if not provided', () => {
      const before = Date.now();
      const event = Validators.ingestEvent({
        type: 'GATE_SCAN',
        facilityId: 'gate-1',
        payload: { count: 5 },
      });
      const after = Date.now();

      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });

    it('should reject invalid event type', () => {
      expect(() => Validators.ingestEvent({
        type: 'INVALID_TYPE',
        facilityId: 'gate-1',
        payload: { count: 5 },
      })).toThrow(ValidationError);
    });

    it('should reject non-object input', () => {
      expect(() => Validators.ingestEvent('invalid')).toThrow(ValidationError);
    });

    it('should reject missing payload', () => {
      expect(() => Validators.ingestEvent({
        type: 'GATE_SCAN',
        facilityId: 'gate-1',
      })).toThrow(ValidationError);
    });

    it('should reject non-object payload', () => {
      expect(() => Validators.ingestEvent({
        type: 'GATE_SCAN',
        facilityId: 'gate-1',
        payload: 'invalid',
      })).toThrow(ValidationError);
    });

    it('should validate all event types', () => {
      const types = ['GATE_SCAN', 'POS_SALE', 'ENTRY', 'EXIT'];
      
      types.forEach(type => {
        const event = Validators.ingestEvent({
          type,
          facilityId: 'gate-1',
          payload: { data: 'test' },
        });
        expect(event.type).toBe(type);
      });
    });
  });

  describe('string', () => {
    it('should validate correct string', () => {
      const str = Validators.string('hello');
      expect(str).toBe('hello');
    });

    it('should reject non-string input', () => {
      expect(() => Validators.string(123)).toThrow(ValidationError);
    });

    it('should enforce minimum length', () => {
      expect(() => Validators.string('ab', 3)).toThrow(ValidationError);
    });

    it('should enforce maximum length', () => {
      expect(() => Validators.string('hello world', 1, 5)).toThrow(ValidationError);
    });

    it('should accept string within length constraints', () => {
      const str = Validators.string('hello', 3, 10);
      expect(str).toBe('hello');
    });

    it('should use default min and max lengths', () => {
      const str = Validators.string('test');
      expect(str).toBe('test');
    });
  });

  describe('number', () => {
    it('should validate correct number', () => {
      const num = Validators.number(42);
      expect(num).toBe(42);
    });

    it('should reject non-number input', () => {
      expect(() => Validators.number('42')).toThrow(ValidationError);
    });

    it('should enforce minimum value', () => {
      expect(() => Validators.number(5, 10)).toThrow(ValidationError);
    });

    it('should enforce maximum value', () => {
      expect(() => Validators.number(100, 0, 50)).toThrow(ValidationError);
    });

    it('should accept number within range', () => {
      const num = Validators.number(25, 0, 50);
      expect(num).toBe(25);
    });

    it('should use default min and max values', () => {
      const num = Validators.number(999999);
      expect(num).toBe(999999);
    });

    it('should handle negative numbers', () => {
      const num = Validators.number(-10, -20, 0);
      expect(num).toBe(-10);
    });
  });
});
