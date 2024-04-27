import { MusicQueue } from './music-queue';

describe('MusicQueue', () => {
  describe('Fill Queue', () => {
    it('Fill up ordered queue', () => {
      const queue = new MusicQueue({ max_queue: 8, max_index: 5 });
      expect(queue.queue).toEqual([0, 1, 2, 3, 4, 0, 1, 2]);
    });

    it('Fill up ordered start queue', () => {
      const queue = new MusicQueue({ max_queue: 8, max_index: 5 }, [2]);
      expect(queue.queue).toEqual([2, 3, 4, 0, 1, 2, 3, 4]);
    });

    it('Fill up ordered exclude queue', () => {
      const queue = new MusicQueue({
        max_queue: 8,
        max_index: 5,
        exclude: [0, 2, 4],
      });
      expect(queue.queue).toEqual([1, 3, 1, 3, 1, 3, 1, 3]);
    });

    it('Fill up random queue', () => {
      const queue = new MusicQueue({
        max_queue: 5,
        max_index: 5,
        random: true,
      });
      expect(queue.queue).not.toEqual([0, 1, 2, 3, 4]);
    });

    it('Fill up random queue inside range', () => {
      const queue = new MusicQueue({
        max_queue: 100,
        max_index: 10,
        random: true,
      });
      expect(queue.queue.every((i) => i >= 0 && i < 10)).toBeTruthy();
    });

    it('Fill up random queue unique', () => {
      const queue = new MusicQueue({
        max_queue: 100,
        max_index: 100,
        random: true,
      });
      expect(new Set(queue.queue).size).toEqual(queue.queue.length);
    });
  });

  describe('Operations', () => {
    it('Peek', () => {
      const queue = new MusicQueue({ max_queue: 5, max_index: 5 });
      expect(queue.peek()).toEqual(0);
      expect(queue.queue).toEqual([0, 1, 2, 3, 4]);
    });

    it('Pop', () => {
      const queue = new MusicQueue({ max_queue: 5, max_index: 5 });
      expect(queue.pop()).toEqual(0);
      expect(queue.queue).toEqual([1, 2, 3, 4]);
    });

    it('Pop And Fill', () => {
      const queue = new MusicQueue({ max_queue: 5, max_index: 5 });
      expect(queue.popAndFill()).toEqual(0);
      expect(queue.queue).toEqual([1, 2, 3, 4, 0]);
    });
  });
});
