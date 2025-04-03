import { ApiKeyManager } from "./apikeymanager.js";
import { McpFunction } from "./function";
import { z } from "zod";

export class CancelBookedLessonFunction implements McpFunction {

    public name: string = "cancelBookedLesson";

    public description: string = "Cancel the reservation of a booked lesson at Home of Zen." +
      "The tool returns the following data:" +
      "- Success, when the cancellation was succesful" + 
      "- An error, when the cancellation was not succesful";

    public inputschema = {
        type: "object",
        email: {
            type: "string",
            description: "TThe e-mail address of the customer that wants to cancel the booked lesson."
        },
        date: {
            type: "string",
            description: "The date you want to cancel the booked lesson. In yyyy-MM-dd format, i.e. '2025-03-14'."
        },
        time: {
            type: "string",
            description: "The start time of the booked lesson you want to cancel. In hh:mm format, i.e. '09:00'."
        },
        required: ["email, date, time"],
    };

    public zschema = { email: z.string(), date: z.string(), time: z.string() };

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
                throw new Error("No parameters provided.")
            }
        
            const { email, date, time } = args;
            const body = {
                email: email,
                date: date,
                time: time
            }
            const response = await fetch("https://cancelbookedlessonv2-illi72bbyq-uc.a.run.app", 
                {
                    method: "POST",
                    headers: {
                        "apiKey": apiKey
                    },
                    body: JSON.stringify(body)
                } as RequestInit
            );
            const json: any = await response.json();
            if (json.result === "Success") {
                return { 
                    content: [{
                        type: "text",
                        text: "Success"
                    }]
                }
            } else {
                throw new Error("Cancellation of the lesson was not successful.");
            }
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