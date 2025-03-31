export class GetScheduleFunction {
    constructor() {
        this.name = "getSchedule";
        this.description = "Return the schedule of lessons and events between the given start date (startDate, yyyy-MM-dd) and the given end date (endDate, yyyy-MM-dd)." +
            "The tool returns a collection of lessons in the schedule, with the following data:" +
            "- The identifier of the lesson (lessonId);" +
            "- The date of the lessen (date, in yyyy-MM-dd format);" +
            "- The day of the week of the lesson (day);" +
            "- The start time of the lesson (startTime, in hh:mm format);" +
            "- The end time of the lesson (endTime, in hh:mm formaat);" +
            "- The name of the lesson (name);" +
            "- The name of the therapist or teacher that teaches the lesson (therapist);" +
            "- The price of the lessen in internal currency Zen (priceInZen);" +
            "- The price of the lesson in Euro (priceInEuro);" +
            "- The type of lesson (type). if type is Lesson then it's a regular lesson, if type is Event it's a irregular event;" +
            "- The capacity of the lesson. How many customers can attend the lesson (capacity)" +
            "- The amount of available spots in the lesson (availableSpots)";
        this.inputschema = {
            type: "object",
            startDate: {
                type: "string",
                description: "The start date from when the schedule is retrieved in format yyyy-MM-dd."
            },
            endDate: {
                type: "string",
                description: "The end date until when the schedule is retrieved in format yyyy-MM-dd."
            },
            required: ["startDate, endDate"],
        };
        this.HOZ_API_KEY = process.env.HOZ_API_KEY;
        if (!this.HOZ_API_KEY) {
            console.error("Error: HOZ_API_KEY environment variable is required");
            process.exit(1);
        }
    }
    async handleExecution(request) {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No start date and end date provided");
        }
        const { startDate, endDate } = args;
        const result = await this.getSchedule(startDate, endDate);
        return result;
    }
    async getSchedule(startDate, endDate) {
        const response = await fetch("https://getschedulev2-illi72bbyq-uc.a.run.app?startDate=" + startDate + "&endDate=" + endDate, {
            method: "GET",
            headers: {
                "apiKey": this.HOZ_API_KEY
            }
        });
        const json = await response.json();
        const content = [];
        for (let i = 0; i < json.length; i++) {
            const lessonInfo = json[i];
            const text = "lessonId: " + lessonInfo.lessonId + ", date: " + lessonInfo.date + ", day: " + lessonInfo.day + ", start time: " + lessonInfo.startTime + ", end time: " + lessonInfo.endTime +
                ", lesson name: " + lessonInfo.name + ", therapist: " + lessonInfo.therapist + ", price in Zen: " + lessonInfo.priceInZen + ", price in Euro: " + lessonInfo.priceInEuro +
                ", type: " + lessonInfo.type + ", capacity: " + lessonInfo.capacity + ", available spots: " + lessonInfo.availableSpots;
            content.push({
                type: "text",
                text: text
            });
        }
        return {
            content: content,
            isError: false
        };
    }
}
