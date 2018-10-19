import moment from 'moment';

export default class TimerHelper {

    getDurationStr = (start, now, duration: string = undefined) => {
        const {
            hours,
            minutes,
            seconds
        } = this.getDurationObj(start, now, duration);
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    getDurationObj = (start, now, prevDuration: string = undefined) => {
        let duration = moment.duration(now.diff(start));
        if (prevDuration) {
            duration = this.combineDuration(duration, prevDuration);
        }

        const hours = duration.get('hours');
        const minutes = duration.get('minutes');
        const seconds = duration.get('seconds');
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        }
    }

    combineDuration = (duration, prevDurationStr): moment.Duration => {
        const prev = prevDurationStr.split(':');
        duration = duration.add(Number.parseInt(prev[0]), 'hours');
        duration = duration.add(Number.parseInt(prev[1]), 'minutes');
        duration = duration.add(Number.parseInt(prev[2]), 'seconds');
        return duration;
    }

    getSQLDateTimeString = (moment: any = undefined) => {
        const format = "YYYY-MM-DD HH:mm:ss";
        const now = moment ? moment : moment();
        return now.format(format);
    }

    pad = (num) => {
        return this.zeroPad(num, 2);
    }

    zeroPad = (num, places) => {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }
}