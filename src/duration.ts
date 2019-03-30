/**
 * A duration with a resolution of 1 millisecond.
 */
export class Duration {

    private readonly ms: number

    private constructor(ms: number) {
        this.ms = ms
    }

    /**
     * Duration given number of milliseconds.
     */
    static ofMilliseconds(ms: number): Duration {
        return new Duration(ms)
    }

    /**
     * Duration given number of seconds.
     */
    static ofSeconds(secs: number): Duration {
        return new Duration(secs * 1000)
    }

    /**
     * Duration given number of minutes.
     */
    static ofMinutes(mins: number): Duration {
        return Duration.ofSeconds(mins * 60)
    }

    /**
     * Duration given number of hours.
     */
    static ofHours(hours: number): Duration {
        return Duration.ofMinutes(hours * 60)
    }

    /**
     * Duration to milliseconds.
     */
    milliseconds(): number {
        return this.ms
    }

    /**
     * Duration to seconds.
     */
    seconds(): number {
        return this.ms / 1000.0
    }

}
