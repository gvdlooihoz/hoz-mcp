import { ApiKeyManager } from "./apikeymanager.js";
import { McpFunction } from "./function";
import { z } from "zod";

export class GetScheduleFunction implements McpFunction {

    public name: string = "getSchedule";

    public description: string = "Return the schedule of lessons between the given start date (startDate, yyyy-MM-dd) and the given end date (endDate, yyyy-MM-dd)." +
      "The tool returns a collection of lessons in the schedule, with the following data:" +
      "- The identifier of the lesson (lessonId);" +
      "- The date of the lessen (date, in yyyy-MM-dd format);" +
      "- The day of the week of the lesson (day);" +
      "- The start time of the lesson (start time, in hh:mm format);" +
      "- The end time of the lesson (end time, in hh:mm formaat);" +
      "- The name of the lesson (lesson name);" +
      "- The name of the therapist or teacher that teaches the lesson (therapist);" +
      "- The price of the lessen in internal currency Zen (price in Zen);" +
      "- The price of the lesson in Euro (price in Euro);" +
      "- The type of lesson (type). if type is Lesson then it's a regular lesson, if type is Event it's a irregular event;" +
      "- The capacity of the lesson. How many customers can attend the lesson (capacity)" +
      "- The amount of available spots in the lesson (available spots)";

    public inputschema: any = {
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

    public zschema = { startDate: z.string(), endDate: z.string() };

    public async handleExecution(args: any, extra: any) {
        try {
            const sessionId = extra.sessionId;
            let apiKey: string | undefined;
            if (sessionId) {
                apiKey = ApiKeyManager.getApiKey(sessionId);
                console.log("Api Key from ApiKeyManager: " + apiKey);
            } else {
                apiKey = process.env.HOZ_API_KEY;
                console.log("Api Key from environment variable: " + apiKey);
            }
            if (!apiKey || apiKey.trim() === "") {
                throw new Error("No HOZ_API_KEY provided. Cannot authorize HoZ API.")
            }
            if (!args) {
                throw new Error("No start and end date provided in parameters.")
            }

            const { startDate, endDate } = args;
            const response = await fetch("https://getschedulev2-illi72bbyq-uc.a.run.app?startDate=" + startDate + "&endDate=" + endDate, 
                {
                    method: "GET",
                    headers: {
                        "apiKey": apiKey
                    }
                } as RequestInit
            );
            const json: Array<any> = await response.json();
            const content: Array<any> = [];
            for (let i=0; i<json.length; i++) {
                const lessonInfo = json[i];
                const text = "lessonId: " + (lessonInfo.type === "lesson"?lessonInfo.lessonId:lessonInfo.eventId) + ", date: " + lessonInfo.date + ", day: " + lessonInfo.day + ", start time: " + lessonInfo.startTime + ", end time: " + lessonInfo.endTime +
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
        } catch (error) {
            return { 
                content: [{
                    type: "text",
                    text: ("Error: " + error)
                }],
                isError: true
            }
        } 
    }

}