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
      creatorId: '11111111-1111-1111-1111-111111111111',
      assignedToId: '22222222-2222-2222-2222-222222222222',
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
