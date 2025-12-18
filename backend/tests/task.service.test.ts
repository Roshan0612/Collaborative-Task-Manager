import { TaskService, CreateTaskDto, UpdateTaskDto } from '../src/services/task.service';
import { z } from 'zod';

describe('TaskService DTO validation', () => {
  test('CreateTaskDto requires valid payload', () => {
    const good = {
      title: 'A',
      description: 'B',
      dueDate: new Date().toISOString(),
      priority: 'HIGH',
      status: 'TODO',
      creatorId: '550e8400-e29b-41d4-a716-446655440000',
      assignedToId: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
    };
    expect(() => CreateTaskDto.parse(good)).not.toThrow();

    const bad = { ...good, title: '' };
    expect(() => CreateTaskDto.parse(bad)).toThrow();
  });

  test('UpdateTaskDto accepts partial updates', () => {
    const good = { status: 'IN_PROGRESS' };
    expect(() => UpdateTaskDto.parse(good)).not.toThrow();
  });

  test('Reject invalid priority', () => {
    const invalid = { priority: 'INVALID' } as any;
    expect(() => UpdateTaskDto.parse(invalid)).toThrow();
  });
});
