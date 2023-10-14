/**
 * Time is useful to calculate time differences for different operations
 */
class Timer {
  constructor() {
    this.reset();
  }

  /**
   * start timer
   */
  start() {
    this.reset();
    this.startTime = new Date();
  }

  /**
   * stop timer
   */
  stop() {
    if (this.startTime) {
      this.endTime = new Date();
    } else {
      throw new Error('Timer is not started');
    }
  }

  /**
   * Get time differnce in milliseconds. If timer is not started/stopped, then it will throw error
   * @returns {number} time differnce in milliseconds
   */
  getDifference() {
    if (this.endTime) {
      return this.endTime.getTime() - this.startTime.getTime();
    } else {
      throw new Error('Timer is not stopped');
    }
  }

  /**
   * Get time differnce in seconds. If timer is not started/stopped, then it will throw error
   * @returns {number} time differnce in seconds
   */
  getDifferenceInSeconds() {
    return Math.round(this.getDifference() / 1000);
  }

  /**
   * reset timer
   */
  reset() {
    this.startTime = undefined;
    this.endTime = undefined;
  }
}

module.exports = Timer;
